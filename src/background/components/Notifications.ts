import { Stream, default as xs } from "xstream";
import delay from "xstream/extra/delay";
import dropRepeats from "xstream/extra/dropRepeats";
import isolate from "@cycle/isolate";
import { Reducer, StateSource } from "@cycle/state";

import { mergeSinks } from "cyclejs-utils";

import produce from "immer";

import { Component, isSome } from "common/types";
import { OptReducer, InitReducer } from "common/state";

import { APISource, APIRequest } from "../drivers/apiDriver";
import {
    NotificationSource,
    NotificationActions,
} from "../drivers/notificationDriver";

import { ChildState } from "./Root";

import { State as EventState, Event } from "./Event";
import { State as MailState, Mail } from "./Mail";
import { State as StatisticState, Statistic } from "./Statistic";
import { State as WarState, War } from "./War";
import { State as TroopsState, Troops } from "./Troops";

export interface NotificationsState {
    settings: {
        refreshPeriod: number;

        war: boolean;
        statistics: boolean;
        events: boolean;
        mail: boolean;
        troops: {
            active: boolean;
            cooldown: number;
            axis: boolean;
            allies: boolean;
        };
    };

    requests: {
        notifications?: {
            status: "sent" | "received" | "error";
            timestamp: number;
        };
        country?: {
            status: "sent" | "received" | "error";
            timestamp: number;
        };
    };

    events?: EventState;
    statistic?: StatisticState;
    mail?: MailState;
    war?: WarState;
    troops?: TroopsState;
}

type State = ChildState<"notifications">;

interface Sources {
    state: StateSource<State | undefined>;
    api: APISource;
    notifications: NotificationSource;
}

interface Sinks {
    state: Stream<Reducer<unknown>>;
    api: Stream<APIRequest>;
    notifications: Stream<NotificationActions>;
}

function delayTime(period: number, timestamp?: number): number {
    if (!timestamp) {
        return 0;
    } else {
        return 1000 * period + timestamp - Date.now();
    }
}

export const Notifications: Component<Sources, Sinks> = sources => {
    const state$ = sources.state.stream.filter(isSome);

    const refreshPeriod$ = state$
        .map(({ settings }) => settings.refreshPeriod)
        .compose(dropRepeats());

    const apiKey$ = state$
        .map(({ global }) => global?.apiKey)
        .filter(isSome)
        .map(({ confirmed, key }) => (confirmed ? key : undefined))
        .compose(dropRepeats());

    const notificationState$ = state$
        .map(({ requests }) => requests.notifications)
        .compose(dropRepeats((prev, next) => prev?.status === next?.status));

    const notificationRequest$ = xs
        .combine(refreshPeriod$, notificationState$, apiKey$)
        .filter(([_, request]) => request?.status !== "sent")
        .map(([period, request, apiKey]) => {
            if (!apiKey) {
                return xs.empty();
            } else {
                return xs
                    .of<APIRequest>({
                        selection: "notifications",
                        apiKey,
                    })
                    .compose(delay(delayTime(period, request?.timestamp)));
            }
        })
        .flatten();
    const countryState$ = state$
        .map(({ requests }) => requests.country)
        .compose(dropRepeats((prev, next) => prev?.status === next?.status));

    const countryRequest$ = xs
        .combine(refreshPeriod$, countryState$, apiKey$)
        .filter(([_, request]) => request?.status !== "sent")
        .map(([period, request, apiKey]) => {
            if (!apiKey) {
                return xs.empty();
            } else {
                return xs
                    .of<APIRequest>({
                        selection: "country",
                        apiKey,
                    })
                    .compose(delay(delayTime(period, request?.timestamp)));
            }
        })
        .flatten();

    const initialReducer$ = xs.of(
        InitReducer<State>({
            settings: {
                refreshPeriod: 30,

                war: true,
                statistics: true,
                events: true,
                mail: true,
                troops: {
                    active: true,
                    axis: true,
                    allies: true,
                    cooldown: 60,
                },
            },
            requests: {},
        })
    );

    const notificationReducer$ = sources.api.response("notifications").mapTo(
        OptReducer((prevState: State) =>
            produce(prevState, draft => {
                const request = draft.requests.notifications;
                if (request) {
                    request.status = "received";
                }
            })
        )
    );

    const countryReducer$ = sources.api.response("country").mapTo(
        OptReducer((prevState: State) =>
            produce(prevState, draft => {
                const request = draft.requests.country;
                if (request) {
                    request.status = "received";
                }
            })
        )
    );

    const sentNotificationReducer$ = notificationRequest$.mapTo(
        OptReducer((prevState: State) =>
            produce(prevState, draft => {
                draft.requests.notifications = {
                    status: "sent",
                    timestamp: Date.now(),
                };
            })
        )
    );

    const sentCountryReducer$ = countryRequest$.mapTo(
        OptReducer((prevState: State) =>
            produce(prevState, draft => {
                draft.requests.country = {
                    status: "sent",
                    timestamp: Date.now(),
                };
            })
        )
    );

    const eventSources = {
        ...sources,
        props: state$.map(state => ({ active: state.settings.events })),
    };

    const eventSinks = isolate(Event, { state: "events" })(eventSources);

    const mailSources = {
        ...sources,
        props: state$.map(state => ({ active: state.settings.mail })),
    };

    const mailSinks = isolate(Mail, { state: "mail" })(mailSources);

    const statisticSources = {
        ...sources,
        props: state$.map(state => ({ active: state.settings.statistics })),
    };

    const statisticSinks = isolate(Statistic, { state: "statistic" })(
        statisticSources
    );

    const warSources = {
        ...sources,
        props: state$.map(state => ({ active: state.settings.war })),
    };

    const warSinks = isolate(War, { state: "war" })(warSources);

    const troopsSources = {
        ...sources,
        props: state$.map(state => state.settings.troops),
    };

    const troopsSinks = isolate(Troops, { state: "troops" })(troopsSources);

    const ownSinks = {
        api: xs.merge(notificationRequest$, countryRequest$),
        state: xs.merge(
            initialReducer$,
            notificationReducer$,
            countryReducer$,
            sentNotificationReducer$,
            sentCountryReducer$
        ),
    };

    return mergeSinks([
        ownSinks,
        eventSinks,
        statisticSinks,
        mailSinks,
        warSinks,
        troopsSinks,
    ]);
};

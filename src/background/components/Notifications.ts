import { Stream, default as xs } from "xstream";
import delay from "xstream/extra/delay";
import dropRepeats from "xstream/extra/dropRepeats";
import isolate from "@cycle/isolate";
import { Reducer, StateSource } from "@cycle/state";

import { mergeSinks } from "cyclejs-utils";

import produce from "immer";

import { NotificationInfo } from "common/models/runtime/notificationInfo";
import { NotificationSettings } from "common/models/runtime/notificationSettings";
import { Component, isSome } from "common/types";
import { OptReducer, InitReducer } from "common/state";

import { APISource, APIRequest } from "../drivers/apiDriver";
import { RuntimeSource, RuntimeMessage } from "../drivers/runtimeDriver";
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

    events: EventState;
    statistic: StatisticState;
    mail: MailState;
    war: WarState;
    troops: TroopsState;
}

type State = ChildState<"notifications">;

interface Sources {
    state: StateSource<State | undefined>;
    api: APISource;
    runtime: RuntimeSource;
    notifications: NotificationSource;
}

interface Sinks {
    state: Stream<Reducer<unknown>>;
    api: Stream<APIRequest>;
    runtime: Stream<RuntimeMessage>;
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

    const notificationSettings$ = sources.runtime.select(
        "NotificationSettings",
        NotificationSettings
    );

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
            },
            events: {
                active: true,
                shown: false,
                dismissed: false,
            },
            mail: {
                active: true,
                shown: false,
                dismissed: false,
            },
            war: {
                active: true,
                shown: false,
                dismissed: false,
            },
            statistic: {
                active: true,
                shown: false,
                dismissed: false,
            },
            troops: {
                active: true,
                axis: true,
                allies: true,
                cooldown: 60,
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

    const settingsReducer$ = notificationSettings$.map(settings =>
        OptReducer((state: State) =>
            produce(state, draft => {
                draft.events.active = settings.events;
                draft.mail.active = settings.mail;
                draft.war.active = settings.war;
                draft.troops.active = settings.troops.active;
                draft.troops.allies = settings.troops.allies;
                draft.troops.axis = settings.troops.axis;
                draft.troops.cooldown = settings.troops.cooldown;
            })
        )
    );

    const eventSinks = isolate(Event, { state: "events" })(sources);

    const mailSinks = isolate(Mail, { state: "mail" })(sources);

    const statisticSinks = isolate(Statistic, { state: "statistic" })(sources);

    const warSinks = isolate(War, { state: "war" })(sources);

    const troopsSinks = isolate(Troops, { state: "troops" })(sources);

    const notificationInfo$ = state$
        .map((state): NotificationInfo | undefined => {
            if (
                !state.statistic.api ||
                !state.war.timestamp ||
                !state.troops.country ||
                !state.troops.units ||
                state.events.unread === undefined ||
                state.mail.unread === undefined
            ) {
                return undefined;
            } else {
                return {
                    country: state.troops.country,
                    timers: {
                        war: state.war.timestamp,
                        statistics: state.statistic.api.timestamp,
                    },

                    queue: {
                        current: state.statistic.api.queued,
                        size: state.statistic.api.queueSize,
                    },

                    units: state.troops.units,
                    events: state.events.unread,
                    mail: state.events.unread,
                };
            }
        })
        .filter(isSome)
        .map(info => ({ kind: "NotificationInfo", data: info }));

    const settings$ = state$
        .map(
            (state): NotificationSettings => ({
                refreshPeriod: state.settings.refreshPeriod,
                events: state.events.active,
                mail: state.mail.active,
                statistic: state.statistic.active,
                war: state.war.active,
                troops: {
                    active: state.troops.active,
                    allies: state.troops.allies,
                    axis: state.troops.axis,
                    cooldown: state.troops.cooldown,
                },
            })
        )
        .map(settings => ({ kind: "NotificationSettings", data: settings }));

    const ownSinks = {
        api: xs.merge(notificationRequest$, countryRequest$),
        state: xs.merge(
            initialReducer$,
            notificationReducer$,
            countryReducer$,
            sentNotificationReducer$,
            sentCountryReducer$,
            settingsReducer$
        ),
        runtime: xs.merge(notificationInfo$, settings$),
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

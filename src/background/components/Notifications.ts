import { Stream, default as xs } from "xstream";
import delay from "xstream/extra/delay";
import dropRepeats from "xstream/extra/dropRepeats";
import isolate from "@cycle/isolate";
import { Reducer, StateSource } from "@cycle/state";

import { mergeSinks } from "cyclejs-utils";

import produce from "immer";

import { Component } from "common/types";
import { OptReducer, InitReducer } from "common/state";

import { APISource, APIRequest } from "../drivers/apiDriver";
import {
    NotificationSource,
    NotificationActions,
} from "../drivers/notificationDriver";

import { State as EventState, Event } from "./Event";
import { State as StatisticState, Statistic } from "./Statistic";

export interface State {
    settings: {
        refreshPeriod: number;

        war: boolean;
        statistics: boolean;
        events: boolean;
        mail: boolean;
    };

    requests: {
        notifications?: {
            status: "sent" | "received" | "error";
            timestamp: number;
        };
    };

    events?: EventState;
    statistic?: StatisticState;
}

interface Props {
    apiKey: string | undefined;
}

interface Sources {
    state: StateSource<State>;
    api: APISource;
    props: Stream<Props>;
    notifications: NotificationSource;
}

interface Sinks {
    state: Stream<Reducer<State>>;
    api: Stream<APIRequest>;
    notifications: Stream<NotificationActions>;
}

function delayTime(period: number, timestamp?: number): number {
    if (!timestamp) {
        return 0;
    } else {
        console.log(1000 * period + timestamp - Date.now());
        return 1000 * period + timestamp - Date.now();
    }
}

export const Notifications: Component<Sources, Sinks> = sources => {
    const state$ = sources.state.stream;
    const props$ = sources.props;

    const refreshPeriod$ = state$
        .map(({ settings }) => settings.refreshPeriod)
        .compose(dropRepeats());

    const requestState$ = state$
        .map(({ requests }) => requests.notifications)
        .compose(dropRepeats((prev, next) => prev?.status === next?.status));

    const apiKey$ = props$.map(({ apiKey }) => apiKey).compose(dropRepeats());

    const notificationRequest$ = xs
        .combine(refreshPeriod$, requestState$, apiKey$)
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

    const initialReducer$ = xs.of(
        InitReducer<State>({
            settings: {
                refreshPeriod: 30,

                war: true,
                statistics: true,
                events: true,
                mail: true,
            },
            requests: {},
        })
    );

    const requestReducer$ = sources.api.response("notifications").mapTo(
        OptReducer((prevState: State) =>
            produce(prevState, draft => {
                const request = draft.requests.notifications;
                if (request) {
                    request.status = "received";
                }
            })
        )
    );

    const sentReducer$ = notificationRequest$.mapTo(
        OptReducer((prevState: State) =>
            produce(prevState, draft => {
                draft.requests.notifications = {
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

    const statisticSources = {
        ...sources,
        props: state$.map(state => ({ active: state.settings.statistics })),
    };

    const statisticSinks = isolate(Statistic, { state: "statistic" })(
        statisticSources
    );

    const ownSinks = {
        api: notificationRequest$,
        state: xs.merge(initialReducer$, requestReducer$, sentReducer$),
    };

    return mergeSinks([ownSinks, eventSinks, statisticSinks]);
};

import { Stream, default as xs } from "xstream";
import delay from "xstream/extra/delay";
import dropRepeats from "xstream/extra/dropRepeats";
import { Reducer, StateSource } from "@cycle/state";

import produce from "immer";

import { Component, isSuccess } from "common/types";
import { OptReducer, InitReducer } from "common/state";

import { APISource, APIRequest } from "../drivers/apiDriver";
import { NotificationActions, create } from "../drivers/notificationDriver";

export interface State {
    settings: {
        refreshPeriod: number;

        war: boolean;
        statistics: boolean;
        events: boolean;
        mails: boolean;
    };

    requests: {
        notifications?: {
            status: "sent" | "received" | "error";
            timestamp: number;
        };
    };
}

interface Props {
    apiKey: string | undefined;
}

interface Sources {
    state: StateSource<State>;
    api: APISource;
    props: Stream<Props>;
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

export const Notifications: Component<Sources, Sinks> = ({
    state,
    api,
    props,
}) => {
    const refreshPeriod$ = state.stream
        .map(({ settings }) => settings.refreshPeriod)
        .compose(dropRepeats());

    const requestState$ = state.stream
        .map(({ requests }) => requests.notifications)
        .compose(dropRepeats((prev, next) => prev?.status === next?.status));

    const apiKey$ = props.map(({ apiKey }) => apiKey).compose(dropRepeats());

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
                mails: true,
            },
            requests: {},
        })
    );
    const notificationReducer$ = api
        .response("notifications")
        .filter(isSuccess)
        .mapTo(
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

    return {
        api: notificationRequest$,
        state: xs.merge(initialReducer$, notificationReducer$, sentReducer$),
        notifications: xs.empty(),
    };
};

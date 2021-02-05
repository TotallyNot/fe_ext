import { Stream, default as xs } from "xstream";
import delay from "xstream/extra/delay";
import { Reducer, StateSource } from "@cycle/state";

import produce from "immer";

import { Component, isSuccess } from "common/types";
import { OptReducer } from "common/state";

import { APISource } from "../drivers/apiDriver";
import {
    NotificationSource,
    NotificationActions,
    create,
    clear,
} from "../drivers/notificationDriver";

export interface State {
    active: boolean;
    shown: boolean;
    dismissed: boolean;

    timestamp?: number;
}

interface Sources {
    state: StateSource<State>;
    api: APISource;
    notifications: NotificationSource;
}

interface Sinks {
    state: Stream<Reducer<State>>;
    notifications: Stream<NotificationActions>;
}

export const War: Component<Sources, Sinks> = ({
    state,
    api,
    notifications,
}) => {
    const response$ = api
        .response("notifications")
        .filter(isSuccess)
        .map(({ data }) => data);

    const create$ = state.stream
        .map(state =>
            state.active && !state.dismissed && !state.shown && state.timestamp
                ? xs
                      .of(undefined)
                      .compose(
                          delay(
                              Math.max(0, state.timestamp * 1000 - Date.now())
                          )
                      )
                : xs.empty<undefined>()
        )
        .flatten()
        .mapTo(
            create("war", {
                title: "Your war timer is up!",
                message: "",
                iconUrl: "placeholder.png",
                type: "basic",
            })
        );

    const clear$ = response$
        .filter(data => data.timers.war * 1000 > Date.now())
        .mapTo(clear("war"));

    const responseReducer$ = response$.map(data =>
        OptReducer((state: State) =>
            produce(state, draft => {
                draft.timestamp = data.timers.war;
            })
        )
    );

    const notificationReducer$ = notifications.select("war").map(event =>
        OptReducer((prev: State) =>
            produce(prev, draft => {
                switch (event.kind) {
                    case "create":
                        draft.shown = true;
                        break;
                    case "clear":
                        draft.shown = false;
                        draft.dismissed = false;
                        break;
                    case "dismissed":
                        draft.dismissed = true;
                }
            })
        )
    );

    return {
        notifications: xs.merge(create$, clear$),
        state: xs.merge(responseReducer$, notificationReducer$),
    };
};

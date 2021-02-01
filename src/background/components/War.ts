import { Stream, default as xs } from "xstream";
import delay from "xstream/extra/delay";
import { Reducer, StateSource } from "@cycle/state";

import produce from "immer";

import { Component, isSuccess } from "common/types";
import { OptReducer, InitReducer } from "common/state";

import { APISource } from "../drivers/apiDriver";
import {
    NotificationSource,
    NotificationActions,
    create,
    clear,
} from "../drivers/notificationDriver";

export interface State {
    shown: boolean;
    dismissed: boolean;
}

interface Props {
    active: boolean;
}

interface Sources {
    state: StateSource<State>;
    api: APISource;
    props: Stream<Props>;
    notifications: NotificationSource;
}

interface Sinks {
    state: Stream<Reducer<State>>;
    notifications: Stream<NotificationActions>;
}

export const War: Component<Sources, Sinks> = ({
    state,
    api,
    props,
    notifications,
}) => {
    const response$ = api
        .response("notifications")
        .filter(isSuccess)
        .map(({ data }) => data);

    const create$ = xs
        .combine(response$, props, state.stream)
        .map(([data, props, state]) =>
            props.active && !state.dismissed && !state.shown
                ? xs
                      .of(undefined)
                      .compose(
                          delay(
                              Math.max(0, data.timers.war * 1000 - Date.now())
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

    const initReducer$ = xs.of(
        InitReducer<State>({ shown: false, dismissed: false })
    );

    return {
        notifications: xs.merge(create$, clear$),
        state: xs.merge(initReducer$, notificationReducer$),
    };
};

import { Stream, default as xs } from "xstream";
import dropRepeats from "xstream/extra/dropRepeats";
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

export const Statistic: Component<Sources, Sinks> = ({
    state,
    api,
    props,
    notifications,
}) => {
    const empty$ = api
        .response("notifications")
        .filter(isSuccess)
        .map(({ data }) => Date.now() - data.timers.statistics * 1000 > 0)
        .compose(dropRepeats());

    const input$ = xs.combine(state.stream, props, empty$);

    const create$ = input$
        .filter(
            ([state, { active }, empty]) =>
                !state.shown && !state.dismissed && active && empty
        )
        .mapTo(
            create("statistic", {
                title: "Your training queue is empty!",
                message: "",
                iconUrl: "placeholder.png",
                type: "basic",
            })
        );

    const clear$ = input$
        .filter(
            ([state, { active }, empty]) =>
                state.shown && (state.dismissed || !active || !empty)
        )
        .mapTo(clear("statistic"));

    const notificationReducer$ = notifications.select("statistic").map(event =>
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

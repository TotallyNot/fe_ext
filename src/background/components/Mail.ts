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

export const Mail: Component<Sources, Sinks> = ({
    state,
    api,
    props,
    notifications,
}) => {
    const unread$ = api
        .response("notifications")
        .filter(isSuccess)
        .map(({ data }) => data.unreadMails)
        .compose(dropRepeats());

    const input$ = xs.combine(state.stream, props, unread$);

    const create$ = input$
        .filter(
            ([state, { active }, unread]) =>
                !state.shown && !state.dismissed && active && unread > 0
        )
        .map(([_state, _props, unread]) =>
            create("mail", {
                title: `You have ${unread} new mail${unread > 1 ? "s" : ""}!`,
                message: "",
                iconUrl: "placeholder.png",
                type: "basic",
            })
        );

    const clear$ = unread$.filter(unread => unread === 0).mapTo(clear("mail"));

    const notificationReducer$ = notifications.select("mail").map(event =>
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

import { Stream, default as xs } from "xstream";
import dropRepeats from "xstream/extra/dropRepeats";
import { Reducer, StateSource } from "@cycle/state";

import produce from "immer";

import { Component, isSuccess, isSome } from "common/types";
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

    unread?: number;
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

export const Event: Component<Sources, Sinks> = ({
    state,
    api,
    notifications,
}) => {
    const response$ = api
        .response("notifications")
        .filter(isSuccess)
        .map(({ data }) => data.unreadEvents)
        .compose(dropRepeats());

    const create$ = state.stream
        .filter(state => !state.shown && !state.dismissed && state.active)
        .map(({ unread }) => unread)
        .compose(dropRepeats())
        .filter(isSome)
        .filter(unread => unread !== 0)
        .map(unread =>
            create("event", {
                title: `You have ${unread} unread event${
                    unread > 1 ? "s" : ""
                }!`,
                message: "",
                iconUrl: "placeholder.png",
                type: "basic",
            })
        );

    const clear$ = state.stream
        .filter(state => state.unread === 0)
        .mapTo(clear("event"));

    const notificationReducer$ = notifications.select("event").map(event =>
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

    const responseReducer$ = response$.map(unread =>
        OptReducer((state: State) =>
            produce(state, draft => {
                if (unread !== state.unread) {
                    draft.unread = unread;
                    draft.shown = false;
                    draft.dismissed = false;
                }
            })
        )
    );

    return {
        notifications: xs.merge(create$, clear$),
        state: xs.merge(responseReducer$, notificationReducer$),
    };
};

import { of, merge } from "rxjs";
import {
    pluck,
    map,
    mapTo,
    filter,
    distinctUntilChanged,
} from "rxjs/operators";

import { Stream } from "xstream";
import { Reducer, StateSource, withState } from "@cycle/state";

import produce from "immer";

import { Component, isSuccess, isSome } from "common/types";
import { OptReducer, InitReducer } from "common/state";
import { streamToObs, obsToStream } from "common/connect";

import { APISource } from "common/drivers/apiDriver";
import {
    NotificationSource,
    NotificationActions,
    create,
    clear,
} from "../../../../drivers/notificationDriver";

import { ChildProps } from "../..";

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
    props: ChildProps;
}

interface Sinks {
    state: Stream<Reducer<State>>;
    notifications: Stream<NotificationActions>;
}

export const mail: Component<Sources, Sinks> = ({
    state,
    api,
    notifications,
    props,
}) => {
    const unread$ = streamToObs(api.response("notifications")).pipe(
        filter(isSuccess),
        pluck("data", "unreadMails"),
        distinctUntilChanged()
    );

    const active$ = props.settings$.pipe(pluck("mail"), distinctUntilChanged());

    const state$ = streamToObs(state.stream);

    const create$ = state$.pipe(
        filter(
            ({ active, shown, dismissed }) => active && !shown && !dismissed
        ),
        pluck("unread"),
        filter(isSome),
        filter(unread => unread !== 0),
        map(unread =>
            create("mail", {
                title: `You have ${unread} unread mail${
                    unread > 1 ? "s" : ""
                }!`,
                message: "",
                iconUrl: "icon256.png",
                type: "basic",
            })
        )
    );

    const clear$ = state$.pipe(
        filter(state => state.unread === 0),
        mapTo(clear("mail"))
    );

    const notificationReducer$ = streamToObs(notifications.select("mail")).pipe(
        map(event =>
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
        )
    );

    const responseReducer$ = unread$.pipe(
        map(unread =>
            OptReducer((state: State) =>
                produce(state, draft => {
                    if (unread !== state.unread) {
                        draft.unread = unread;
                        draft.shown = false;
                        draft.dismissed = false;
                    }
                })
            )
        )
    );

    const settingsReducer$ = active$.pipe(
        map(active => OptReducer<State>(state => ({ ...state, active })))
    );

    const initReducer$ = of(
        InitReducer<State>({ active: false, shown: false, dismissed: false })
    );

    const reducer$ = merge(
        notificationReducer$,
        responseReducer$,
        settingsReducer$,
        initReducer$
    );

    const notification$ = merge(create$, clear$);

    return {
        notifications: obsToStream(notification$),
        state: obsToStream(reducer$),
    };
};

export default withState(mail);

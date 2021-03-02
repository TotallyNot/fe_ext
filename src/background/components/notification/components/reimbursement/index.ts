import { of, timer, merge, EMPTY } from "rxjs";
import {
    pluck,
    map,
    mapTo,
    switchMap,
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

    timestamp?: number;
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

export const reimbursement: Component<Sources, Sinks> = ({
    state,
    api,
    notifications,
    props,
}) => {
    const response$ = streamToObs(api.response("notifications")).pipe(
        filter(isSuccess),
        pluck("data")
    );

    const active$ = props.settings$.pipe(
        pluck("reimburse"),
        distinctUntilChanged()
    );

    const state$ = streamToObs(state.stream);

    const create$ = state$.pipe(
        switchMap(({ active }) =>
            !active
                ? EMPTY
                : state$.pipe(
                      filter(({ shown, dismissed }) => !shown && !dismissed),
                      pluck("timestamp"),
                      filter(isSome),
                      switchMap(timestamp =>
                          timer(Math.max(0, timestamp * 1000 - Date.now()))
                      )
                  )
        ),
        mapTo(
            create("reimburse", {
                title: "Your reimbursement is ready!",
                message: "",
                iconUrl: "icon256.png",
                type: "basic",
            })
        )
    );

    const clear$ = state$.pipe(
        pluck("timestamp"),
        filter(isSome),
        filter(timestamp => timestamp * 1000 > Date.now()),
        mapTo(clear("reimburse"))
    );

    const responseReducer$ = response$.pipe(
        map(data =>
            OptReducer((state: State) =>
                produce(state, draft => {
                    draft.timestamp = data.timers.reimbursement;
                })
            )
        )
    );

    const notificationReducer$ = streamToObs(
        notifications.select("reimburse")
    ).pipe(
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

    const settingReducer$ = active$.pipe(
        map(active => OptReducer<State>(state => ({ ...state, active })))
    );

    const initReducer$ = of(
        InitReducer<State>({ active: false, shown: false, dismissed: false })
    );

    const notification$ = merge(create$, clear$);

    const reducer$ = merge(
        initReducer$,
        notificationReducer$,
        responseReducer$,
        settingReducer$
    );
    return {
        notifications: obsToStream(notification$),
        state: obsToStream(reducer$),
    };
};

export default withState(reimbursement);

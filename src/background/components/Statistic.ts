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
} from "../drivers/notificationDriver";

import { ChildProps } from "./Notifications";

export interface State {
    active: boolean;
    shown: boolean;
    dismissed: boolean;

    api?: {
        lastTrained: number;
        timestamp: number;
        queued: number;
        queueSize: number;
    };
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

const stats: { [key: number]: string } = {
    1: "strength",
    2: "intelligence",
    3: "leadership",
    4: "communication",
};

export const training: Component<Sources, Sinks> = ({
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
        pluck("training"),
        distinctUntilChanged()
    );

    const state$ = streamToObs(state.stream);

    const create$ = state$.pipe(
        switchMap(({ active, api }) =>
            !active || api?.queued !== 0
                ? EMPTY
                : state$.pipe(
                      filter(({ shown, dismissed }) => !shown && !dismissed),
                      pluck("api"),
                      filter(isSome),
                      switchMap(({ timestamp, lastTrained }) =>
                          timer(
                              Math.max(0, timestamp * 1000 - Date.now())
                          ).pipe(mapTo(lastTrained))
                      )
                  )
        ),
        map(lastTrained =>
            create("statistic", {
                title: "Your training queue is empty!",
                message: lastTrained
                    ? `You finished training your ${stats[lastTrained]}.`
                    : "",
                iconUrl: "placeholder.png",
                type: "basic",
            })
        )
    );

    const clear$ = state$.pipe(
        pluck("api"),
        filter(isSome),
        filter(
            ({ queued, timestamp }) =>
                queued > 0 || timestamp * 1000 > Date.now()
        ),
        mapTo(clear("statistic"))
    );

    const notificationReducer$ = streamToObs(
        notifications.select("statistic")
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
                            break;
                    }
                })
            )
        )
    );

    const responseReducer$ = response$.pipe(
        map(data =>
            OptReducer((state: State) =>
                produce(state, draft => {
                    draft.api = {
                        lastTrained: data.training.currentlyTraining,
                        timestamp: data.timers.statistics,
                        queued: data.training.queued.length,
                        queueSize: data.training.queueSize,
                    };
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

export default withState(training);

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

export const Statistic: Component<Sources, Sinks> = ({
    state,
    api,
    notifications,
}) => {
    const response$ = api
        .response("notifications")
        .filter(isSuccess)
        .map(({ data }) => data)
        .remember();

    const create$ = state.stream
        .map(state =>
            state.api?.queued === 0 &&
            state.active &&
            !state.dismissed &&
            !state.shown
                ? xs
                      .of(state.api.lastTrained)
                      .compose(
                          delay(
                              Math.max(
                                  0,
                                  state.api.timestamp * 1000 - Date.now()
                              )
                          )
                      )
                : xs.empty<number>()
        )
        .flatten()
        .map(lastTrained =>
            create("statistic", {
                title: "Your training queue is empty!",
                message: lastTrained
                    ? `You finished training your ${stats[lastTrained]}.`
                    : "",
                iconUrl: "placeholder.png",
                type: "basic",
            })
        );

    const clear$ = state.stream
        .filter(
            state =>
                state.api !== undefined &&
                (state.api.queued > 0 ||
                    state.api.timestamp * 1000 > Date.now())
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
                    case "dismissed":
                        draft.dismissed = true;
                        break;
                }
            })
        )
    );

    const responseReducer$ = response$.map(data =>
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
    );

    return {
        notifications: xs.merge(create$, clear$),
        state: xs.merge(notificationReducer$, responseReducer$),
    };
};

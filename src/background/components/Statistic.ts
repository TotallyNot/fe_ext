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
    lastTrained?: number;
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

const stats: { [key: number]: string } = {
    1: "strength",
    2: "intelligence",
    3: "leadership",
    4: "communication",
};

export const Statistic: Component<Sources, Sinks> = ({
    state,
    api,
    props,
    notifications,
}) => {
    const response$ = api
        .response("notifications")
        .filter(isSuccess)
        .map(({ data }) => data)
        .remember();

    const create$ = xs
        .combine(response$, props, state.stream)
        .map(([data, props, state]) =>
            data.training.queued.length === 0 &&
            props.active &&
            !state.dismissed &&
            !state.shown
                ? xs
                      .of(state.lastTrained)
                      .compose(
                          delay(
                              Math.max(
                                  0,
                                  data.timers.statistics * 1000 - Date.now()
                              )
                          )
                      )
                : xs.empty<number | undefined>()
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

    const clear$ = response$
        .filter(
            data =>
                data.training.queued.length > 0 ||
                data.timers.statistics * 1000 > Date.now()
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
        OptReducer(
            (prev: State): State => ({
                ...prev,
                lastTrained: data.training.currentlyTraining,
            })
        )
    );

    const initReducer$ = xs.of(
        InitReducer<State>({ shown: false, dismissed: false })
    );

    return {
        notifications: xs.merge(create$, clear$),
        state: xs.merge(initReducer$, notificationReducer$, responseReducer$),
    };
};

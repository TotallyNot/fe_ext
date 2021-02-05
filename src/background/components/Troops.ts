import { Stream, default as xs } from "xstream";
import pairwise from "xstream/extra/pairwise";
import throttle from "xstream/extra/throttle";
import sampleCombine from "xstream/extra/sampleCombine";
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
    country?: string;

    units?: {
        axis: number;
        allies: number;
    };
}

interface Props {
    active: boolean;
    cooldown: number;

    axis: boolean;
    allies: boolean;
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

export const Troops: Component<Sources, Sinks> = sources => {
    const response$ = sources.api
        .response("country")
        .filter(isSuccess)
        .map(({ data }) => data);

    const props$ = sources.props;
    const state$ = sources.state.stream;

    const initReducer$ = xs.of(InitReducer<State>({}));

    const responseReducer$ = response$.map(data =>
        OptReducer((state: State) =>
            produce(state, draft => {
                draft.units = data.units;
                draft.country = data.name;
            })
        )
    );

    const alliesCreate$ = props$
        .compose(dropRepeats())
        .map(({ active, allies, cooldown }) =>
            active && allies
                ? state$
                      .compose(
                          dropRepeats(
                              (prev, curr) => prev.country === curr.country
                          )
                      )
                      .mapTo(
                          state$
                              .map(state => state.units?.allies)
                              .compose(pairwise)
                              .map(([prev, curr]) => (curr ?? 0) - (prev ?? 0))
                              .compose(dropRepeats())
                              .filter(diff => diff !== 0)
                              .compose(throttle(cooldown * 1000))
                      )
                      .flatten()
                : xs.never<number>()
        )
        .flatten()
        .compose(sampleCombine(state$))
        .map(([diff, state]) =>
            create("troops_allies", {
                title: `Allied units in ${state.country}`,
                message: `Changed by ${diff}!`,
                iconUrl: "placeholder.png",
                type: "basic",
            })
        );

    const axisCreate$ = props$
        .compose(dropRepeats())
        .map(({ active, axis, cooldown }) =>
            active && axis
                ? state$
                      .compose(
                          dropRepeats(
                              (prev, curr) => prev.country === curr.country
                          )
                      )
                      .mapTo(
                          state$
                              .map(state => state.units?.axis)
                              .compose(pairwise)
                              .map(([prev, curr]) => (curr ?? 0) - (prev ?? 0))
                              .compose(dropRepeats())
                              .filter(diff => diff !== 0)
                              .compose(throttle(cooldown * 1000))
                      )
                      .flatten()
                : xs.never<number>()
        )
        .flatten()
        .compose(sampleCombine(state$))
        .map(([diff, state]) =>
            create("troops_axis", {
                title: `Axis units in ${state.country}`,
                message: `Changed by ${diff}!`,
                iconUrl: "placeholder.png",
                type: "basic",
            })
        );

    return {
        state: xs.merge(initReducer$, responseReducer$),
        notifications: xs.merge(alliesCreate$, axisCreate$),
    };
};

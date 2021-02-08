import { Stream, default as xs } from "xstream";
import pairwise from "xstream/extra/pairwise";
import throttle from "xstream/extra/throttle";
import sampleCombine from "xstream/extra/sampleCombine";
import dropRepeats from "xstream/extra/dropRepeats";
import { Reducer, StateSource } from "@cycle/state";

import produce from "immer";

import { Component, isSuccess } from "common/types";
import { OptReducer } from "common/state";

import { APISource } from "../drivers/apiDriver";
import {
    NotificationSource,
    NotificationActions,
    create,
} from "../drivers/notificationDriver";

export interface State {
    country?: string;

    units?: {
        axis: number;
        allies: number;
    };

    active: boolean;
    cooldown: number;

    axis: boolean;
    allies: boolean;
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

export const Troops: Component<Sources, Sinks> = sources => {
    const response$ = sources.api
        .response("country")
        .filter(isSuccess)
        .map(({ data }) => data);

    const state$ = sources.state.stream;

    const responseReducer$ = response$.map(data =>
        OptReducer((state: State) =>
            produce(state, draft => {
                draft.units = data.units;
                draft.country = data.name;
            })
        )
    );

    const alliesCreate$ = state$
        .map(({ cooldown }) => cooldown)
        .compose(dropRepeats())
        .map(cooldown =>
            state$
                .filter(state => state.active && state.allies)
                .compose(pairwise)
                .filter(
                    ([prev, curr]) =>
                        prev.country !== undefined &&
                        prev.units !== undefined &&
                        prev.country === curr.country
                )
                .map(([prev, curr]) => curr.units!.allies - prev.units!.allies)
                .filter(diff => diff !== 0)
                .compose(throttle(cooldown * 1000))
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

    const axisCreate$ = state$
        .map(({ cooldown }) => cooldown)
        .compose(dropRepeats())
        .map(cooldown =>
            state$
                .filter(state => state.active && state.axis)
                .compose(pairwise)
                .filter(
                    ([prev, curr]) =>
                        prev?.country !== undefined &&
                        prev.units !== undefined &&
                        prev.country === curr.country
                )
                .map(([prev, curr]) => curr.units!.axis - prev.units!.axis)
                .filter(diff => diff !== 0)
                .compose(throttle(cooldown * 1000))
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
        state: xs.merge(responseReducer$),
        notifications: xs.merge(alliesCreate$, axisCreate$),
    };
};

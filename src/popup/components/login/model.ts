import { Stream, default as xs } from "xstream";

import { Reducer } from "@cycle/state";

import { InitReducer, OptReducer } from "common/state";

import { Inputs } from "./intent";

export interface State {
    waiting: boolean;
    error: boolean;
    message?: string;
}

export interface Sinks {
    state: Stream<Reducer<any>>;
}

export const model = ({ login$, error$ }: Inputs): Sinks => {
    const defaultReducer$ = xs.of(
        InitReducer<State>({ waiting: false, error: false })
    );
    const waitReducer$ = login$.mapTo(
        OptReducer<State>(state => ({ ...state, waiting: true }))
    );
    const errorReducer$ = error$.map(error =>
        OptReducer<State>(_ => ({
            waiting: false,
            error: true,
            message: error,
        }))
    );

    return {
        state: xs.merge(defaultReducer$, waitReducer$, errorReducer$),
    };
};

import { default as xs } from "xstream";

import { InitReducer } from "common/state";

import { Inputs } from "./intent";

export interface State {}

export const model = (_inputs: Inputs) => {
    const initialReducer$ = xs.of(InitReducer<State>({}));

    return initialReducer$;
};

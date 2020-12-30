import { Stream, default as xs } from "xstream";
import { Reducer, StateSource } from "@cycle/state";

import { OptReducer, InitReducer } from "common/state";

import { APISource } from "../drivers/apiDriver";

export interface State {
    key?: string;
    message?: string;
}

interface Sources {
    state: StateSource<State>;
    api: APISource;
}

interface Sinks {
    state: Stream<Reducer<State>>;
}

export const APIKey = (sources: Sources): Sinks => {
    const error$ = sources.api.errors();

    const initial$ = xs.of(
        InitReducer<State>({ key: "" })
    );

    const invalid$ = error$
        .filter(error => error.data.code === 1)
        .map(() =>
            OptReducer(
                (): State => ({
                    key: undefined,
                    message: "Key is invalid!",
                })
            )
        );

    return {
        state: xs.merge(initial$, invalid$),
    };
};

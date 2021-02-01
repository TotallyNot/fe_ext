import { Stream, default as xs } from "xstream";
import { Reducer, StateSource } from "@cycle/state";
import produce from "immer";

import { createReducer, OptReducer, InitReducer } from "common/state";
import { isFailure, isSome } from "common/types";
import { APIKey as APIKeyMessage } from "common/models/runtime";
import pluck from "common/xs/pluck";

import { APISource, APIRequest } from "../drivers/apiDriver";
import { RuntimeSource, RuntimeMessage } from "../drivers/runtimeDriver";
import { ChildState } from "./Root";

export interface APIKeyState {
    key?: string;
    message?: string;
    confirmed?: boolean;
}

type State = ChildState<"apiKey">;

interface Sources {
    state: StateSource<State | undefined>;
    api: APISource;
    runtime: RuntimeSource;
}

interface Sinks {
    state: Stream<Reducer<State>>;
    api: Stream<APIRequest>;
    runtime: Stream<RuntimeMessage>;
}

export const APIKey = (sources: Sources): Sinks => {
    const error$ = sources.api.errors();

    const initial$ = xs.of(
        InitReducer<State>({ global: {} })
    );

    const key$ = sources.runtime
        .select("apiKey", APIKeyMessage)
        .compose(pluck("key"));

    const verifyRequest$ = key$.map(
        (key): APIRequest => ({ apiKey: key, selection: "user" })
    );

    const invalid$ = error$
        .filter(error => error.data.code === 1)
        .mapTo(
            OptReducer((_state: State) => ({
                global: {},
                key: undefined,
                confirmed: false,
                message: "Key is invalid!",
            }))
        );

    const newKey$ = key$.map(
        (key): Reducer<State> => () => ({
            key,
            confirmed: false,
            global: {},
        })
    );

    const confirm$ = sources.api.response("user").map(response =>
        OptReducer((state: State) =>
            produce(state, draft => {
                if (isFailure(response)) {
                    draft.key = undefined;
                    draft.message = response.data.reason;
                    draft.confirmed = undefined;
                } else {
                    draft.confirmed = true;
                    draft.message = undefined;
                }
            })
        )
    );

    return {
        state: xs.merge(initial$, invalid$, newKey$, confirm$),
        api: verifyRequest$,
        runtime: sources.state.stream
            .filter(isSome)
            .map(({ confirmed, message }) => ({
                kind: "apiKeyResponse",
                data: confirmed
                    ? { success: true }
                    : { success: false, reason: message },
            })),
    };
};

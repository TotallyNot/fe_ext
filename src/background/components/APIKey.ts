import { Stream, default as xs } from "xstream";
import { Reducer, StateSource } from "@cycle/state";
import produce from "immer";

import { OptReducer, InitReducer } from "common/state";
import { isFailure, isSome } from "common/types";
import { APIKey as APIKeyMessage } from "common/models/runtime";
import pluck from "common/xs/pluck";

import { APISource, APIRequest } from "../drivers/apiDriver";
import { RuntimeSource, RuntimeMessage } from "../drivers/runtimeDriver";
import { ChildState } from "./Root";

export interface APIKeyState {
    key?: string;
    message?: string;
    confirmed: boolean;
    error: boolean;
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
        InitReducer<State>({ confirmed: false, error: false })
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
                key: undefined,
                confirmed: false,
                error: true,
                message: "Invalid key!",
            }))
        );

    const otherError$ = error$
        .filter(error => error.data.code !== 1)
        .map(error =>
            OptReducer((state: State) =>
                produce(state, draft => {
                    draft.message = error.reason ? error.reason : undefined;
                    draft.error = true;
                })
            )
        );

    const newKey$ = key$.map(
        (key): Reducer<State> => () => ({
            key,
            confirmed: false,
            error: false,
        })
    );

    const confirm$ = verifyRequest$
        .mapTo(sources.api.response("user"))
        .flatten()
        .map(response =>
            OptReducer((state: State) =>
                produce(state, draft => {
                    if (isFailure(response)) {
                        draft.key = undefined;
                        draft.confirmed = false;
                    } else {
                        draft.confirmed = true;
                        draft.message = undefined;
                    }
                })
            )
        );

    return {
        state: xs.merge(initial$, invalid$, newKey$, confirm$, otherError$),
        api: verifyRequest$,
        runtime: sources.state.stream
            .filter(isSome)
            .map(({ confirmed, error, message }) => ({
                kind: "apiKeyResponse",
                data: { loggedIn: confirmed, reason: message, error },
            })),
    };
};

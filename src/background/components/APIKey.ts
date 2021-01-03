import { Stream, default as xs } from "xstream";
import { Reducer, StateSource } from "@cycle/state";
import sampleCombine from "xstream/extra/sampleCombine";

import { createReducer } from "common/state";

import { APISource, APIRequest } from "../drivers/apiDriver";
import { RuntimeSource, RuntimeMessage } from "../drivers/runtimeDriver";

import { isFailure } from "common/types";
import { APIKey as APIKeyMessage } from "common/models/runtime";
import pluck from "common/xs/pluck";

export interface State {
    key?: string;
    message?: string;
    confirmed?: boolean;
}

interface Sources {
    state: StateSource<State>;
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
        createReducer<State>({ key: "CeQAoS53hk" }).build()
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
            createReducer<State>({
                key: undefined,
                confirmed: false,
                message: "Key is invalid!",
            }).build()
        );

    const newKey$ = key$.map(key =>
        createReducer<State>({ key, confirmed: false }).build()
    );

    const confirm$ = sources.api
        .response("user")
        .compose(sampleCombine(sources.state.stream))
        .map(([response, state]) =>
            createReducer(state)
                .add(prev => ({
                    key: isFailure(response) ? undefined : prev.key,
                    message: isFailure(response)
                        ? response.data.reason
                        : undefined,
                    confirmed: !isFailure(response),
                }))
                .build()
        );

    return {
        state: xs.merge(invalid$, newKey$, confirm$),
        api: verifyRequest$,
        runtime: sources.state.stream.map(({ confirmed, message }) => ({
            kind: "apiKeyResponse",
            data: confirmed
                ? { success: true }
                : { success: false, reason: message },
        })),
    };
};

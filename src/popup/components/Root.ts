import { Stream, default as xs } from "xstream";

import { MainDOMSource, VNode, div } from "@cycle/dom";
import { withState, StateSource, Reducer } from "@cycle/state";
import isolate from "@cycle/isolate";

import { mergeSinks } from "cyclejs-utils";

import {
    BackgroundSource,
    RuntimeMessage,
} from "common/drivers/backgroundDriver";
import { APIKey } from "common/models/runtime";
import { Component } from "common/types";

import { login, State as LoginState } from "./login";

interface State {
    login?: LoginState;
}

interface Sources {
    DOM: MainDOMSource;
    background: BackgroundSource;
    state: StateSource<State>;
}

export interface Sinks {
    DOM: Stream<VNode>;
    background: Stream<RuntimeMessage>;
    state: Stream<Reducer<unknown>>;
}

const Root: Component<Sources, Sinks> = sources => {
    const loginSinks = isolate(login, { state: "login" })(sources);

    const ownSinks = {
        background: xs.never<RuntimeMessage>(),
    };

    return mergeSinks([ownSinks, loginSinks]);

    /*
    const popup$ = sources.background
        .select("apiKey", APIKey)
        .map(({ key }) => div(key));

    return {
        DOM: popup$,
        background: xs.of({ kind: "apiKey", data: { key: "CeQAoS53hk" } }),
    }; */
};

export default withState(Root);

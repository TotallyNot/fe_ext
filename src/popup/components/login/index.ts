import xs from "xstream";

import { Component } from "common/types";
import { Sinks } from "../Root";

import { intent, Sources } from "./intent";
import { model } from "./model";
import { view } from "./view";

export { State } from "./model";

export const login: Component<Sources, Partial<Sinks>> = sources => {
    const actions = intent(sources);

    return {
        DOM: view(sources.state).DOM,
        state: model(actions).state,
        background: xs
            .combine(actions.input$, actions.login$)
            .map(([key, _]) => ({ kind: "apiKey", data: { key } })),
    };
};

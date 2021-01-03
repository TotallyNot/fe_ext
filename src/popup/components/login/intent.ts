import { default as xs } from "xstream";

import { MainDOMSource } from "@cycle/dom";
import { StateSource } from "@cycle/state";

import pluck from "common/xs/pluck";
import { State } from "./model";

import { APIKeyResponse } from "common/models/runtime";
import { BackgroundSource } from "common/drivers/backgroundDriver";

export interface Sources {
    DOM: MainDOMSource;
    background: BackgroundSource;
    state: StateSource<State>;
}

export const intent = (sources: Sources) => {
    const response$ = sources.background.select(
        "apiKeyResponse",
        APIKeyResponse
    );

    const error$ = response$
        .debug()
        .filter(({ success }) => !success)
        .compose(pluck("reason"));

    return {
        login$: sources.DOM.select("button")
            .events("click")
            .mapTo(undefined),
        input$: sources.DOM.select("input")
            .events("change")
            .map(event => (event.target as HTMLInputElement).value),
        error$,
    };
};

export type Inputs = ReturnType<typeof intent>;

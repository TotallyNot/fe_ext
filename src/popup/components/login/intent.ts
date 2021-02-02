import { MainDOMSource } from "@cycle/dom";
import { StateSource } from "@cycle/state";
import { HistoryInput } from "@cycle/history";

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
        .filter(({ error }) => error)
        .compose(pluck("reason"));

    const loggedIn$ = response$
        .filter(({ loggedIn }) => loggedIn)
        .mapTo("/popup" as HistoryInput);

    const login$ = sources.DOM.select("form")
        .events("submit")
        .map(event => {
            event.preventDefault();
            return (event.target as any).elements.key.value as string;
        });

    return {
        login$,
        error$,
        loggedIn$,
    };
};

export type Inputs = ReturnType<typeof intent>;

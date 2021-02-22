import { MainDOMSource } from "@cycle/dom";
import { StateSource } from "@cycle/state";

import { BackgroundSource } from "common/drivers/backgroundDriver";
import { DBSource } from "common/drivers/dbDriver";
import { APISource } from "common/drivers/apiDriver";

import { isSuccess, isFailure } from "common/types";

import { State } from "./model";

export interface Sources {
    DOM: MainDOMSource;
    background: BackgroundSource;
    state: StateSource<State>;
    DB: DBSource;
    api: APISource;
}

export const intent = (sources: Sources) => {
    const login$ = sources.DOM.select("form")
        .events("submit")
        .map(event => {
            event.preventDefault();
            return (event.target as any).elements.key.value as string;
        });

    const response$ = sources.api.response("user");

    const success$ = response$.filter(isSuccess).map(({ data }) => data);
    const failure$ = response$.filter(isFailure).map(({ data }) => data.reason);

    return {
        login$,
        success$,
        failure$,
    };
};

export type Inputs = ReturnType<typeof intent>;

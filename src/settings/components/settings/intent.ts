import { MainDOMSource } from "@cycle/dom";
import { StateSource } from "@cycle/state";

import { DBSource } from "common/drivers/dbDriver";

import { State } from "./model";

export interface Sources {
    DOM: MainDOMSource;
    state: StateSource<State>;
    DB: DBSource;
}

export const intent = (_sources: Sources) => {
    return {};
};

export type Inputs = ReturnType<typeof intent>;

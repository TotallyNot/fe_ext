import { MainDOMSource } from "@cycle/dom";
import { StateSource } from "@cycle/state";

import { BackgroundSource } from "common/drivers/backgroundDriver";

import { State } from "./model";

export interface Sources {
    DOM: MainDOMSource;
    background: BackgroundSource;
    state: StateSource<State>;
}

export const intent = (_sources: Sources) => {
    return {};
};

export type Inputs = ReturnType<typeof intent>;

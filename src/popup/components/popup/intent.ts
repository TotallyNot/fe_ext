import { MainDOMSource } from "@cycle/dom";
import { StateSource } from "@cycle/state";

import { BackgroundSource } from "common/drivers/backgroundDriver";

import { State } from "./model";

import { NotificationInfo } from "common/models/runtime/notificationInfo";

export interface Sources {
    DOM: MainDOMSource;
    background: BackgroundSource;
    state: StateSource<State>;
}

export const intent = (sources: Sources) => {
    const notificationInfo$ = sources.background
        .select("NotificationInfo", NotificationInfo)
        .debug();

    return {
        notificationInfo$,
    };
};

export type Inputs = ReturnType<typeof intent>;

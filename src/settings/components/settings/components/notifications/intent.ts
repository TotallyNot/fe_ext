import { MainDOMSource } from "@cycle/dom";
import { StateSource } from "@cycle/state";

import { streamToObs } from "common/connect";

import { BackgroundSource } from "common/drivers/backgroundDriver";
import { NotificationSettings } from "common/models/runtime/notificationSettings";

import { State } from "./model";

export interface Sources {
    DOM: MainDOMSource;
    background: BackgroundSource;
    state: StateSource<State>;
}

export const intent = (sources: Sources) => {
    const notificationSettings$ = streamToObs(
        sources.background.select("NotificationSettings", NotificationSettings)
    );

    const checkbox$ = streamToObs(
        sources.DOM.select("input[type=checkbox]").events("change")
    );

    const numberField$ = streamToObs(
        sources.DOM.select("input[type=number]").events("change")
    );

    return {
        notificationSettings$,
        checkbox$,
        numberField$,
    };
};

export type Inputs = ReturnType<typeof intent>;

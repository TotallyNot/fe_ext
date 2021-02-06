import xs from "xstream";

import { MainDOMSource } from "@cycle/dom";
import { StateSource } from "@cycle/state";

import { BackgroundSource } from "common/drivers/backgroundDriver";
import { NotificationSettings } from "common/models/runtime/notificationSettings";

import { State } from "./model";

export interface Sources {
    DOM: MainDOMSource;
    background: BackgroundSource;
    state: StateSource<State>;
}

export const intent = (sources: Sources) => {
    const notificationSettings$ = sources.background
        .select("NotificationSettings", NotificationSettings)
        .debug();

    const event$ = sources.DOM.select("#events").events("change");
    const mail$ = sources.DOM.select("#mail").events("change");
    const war$ = sources.DOM.select("#war").events("change");
    const statistic$ = sources.DOM.select("#training").events("change");

    const troops$ = sources.DOM.select("#troops").events("change");
    const troopsAllies$ = sources.DOM.select("#troopsAllies").events("change");
    const troopsAxis$ = sources.DOM.select("#troopsAxis").events("change");
    const troopsCooldown$ = sources.DOM.select("#troopsCooldown").events(
        "blur"
    );

    return {
        notificationSettings$,

        event$,
        mail$,
        war$,
        statistic$,

        troops$,
        troopsAllies$,
        troopsAxis$,
        troopsCooldown$,
    };
};

export type Inputs = ReturnType<typeof intent>;

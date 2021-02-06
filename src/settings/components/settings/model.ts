import { Stream, default as xs } from "xstream";

import { Reducer } from "@cycle/state";

import produce from "immer";

import { OptReducer } from "common/state";
import { NotificationSettings } from "common/models/runtime/notificationSettings";

import { Inputs } from "./intent";

export interface State {
    notification: NotificationSettings;
    notificationOut?: NotificationSettings;
}

export interface Sinks {
    state: Stream<Reducer<any>>;
}

export const model = (inputs: Inputs): Sinks => {
    const runtimeReducer$ = inputs.notificationSettings$.map(
        (notification): Reducer<State> => () => ({
            notification,
        })
    );

    const checkboxReducer$ = xs
        .merge(inputs.event$, inputs.mail$, inputs.war$, inputs.statistic$)
        .map(event =>
            OptReducer((state: State) =>
                produce(state, draft => {
                    if (!draft.notificationOut) {
                        draft.notificationOut = {
                            ...draft.notification,
                            troops: draft.notification.troops,
                        };
                    }
                    const name = (event.target as any).name as string;
                    (draft.notificationOut as any)[
                        name
                    ] = (event.target as any).checked;
                })
            )
        );

    const troopsReducer$ = xs
        .merge(
            inputs.troops$,
            inputs.troopsAllies$,
            inputs.troopsAxis$,
            inputs.troopsCooldown$
        )
        .map(event =>
            OptReducer((state: State) =>
                produce(state, draft => {
                    if (!draft.notificationOut) {
                        draft.notificationOut = {
                            ...draft.notification,
                            troops: draft.notification.troops,
                        };
                    }
                    const target = event.target as any;
                    switch (target.id) {
                        case "troops":
                            draft.notificationOut.troops.active = target.checked as boolean;
                            break;
                        case "troopsAllies":
                            draft.notificationOut.troops.allies = target.checked as boolean;
                            break;
                        case "troopsAxis":
                            draft.notificationOut.troops.axis = target.checked as boolean;
                            break;
                        case "troopsCooldown":
                            draft.notificationOut.troops.cooldown = Math.max(
                                5,
                                target.value as number
                            );
                            break;
                    }
                })
            )
        );

    return {
        state: xs.merge(runtimeReducer$, checkboxReducer$, troopsReducer$),
    };
};

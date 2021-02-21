import { merge } from "rxjs";
import { map, first, skip } from "rxjs/operators";

import { Reducer } from "@cycle/state";

import produce from "immer";

import { obsToStream } from "common/connect";
import { OptReducer } from "common/state";
import { NotificationSettings } from "common/models/runtime/notificationSettings";

import { Inputs } from "./intent";

export interface State {
    notification: NotificationSettings;
    notificationOut: NotificationSettings;
}

type TypeKey<O, T> = {
    [K in keyof O]: O[K] extends T ? K : never;
}[keyof O];

type CheckboxKey = TypeKey<NotificationSettings, boolean>;

type NumberFieldKey = TypeKey<NotificationSettings, number>;

export const model = (inputs: Inputs) => {
    const initialReducer$ = inputs.notificationSettings$.pipe(
        first(),
        map(
            (notification): Reducer<State> => () => ({
                notification,
                notificationOut: { ...notification },
            })
        )
    );

    const runtimeReducer$ = inputs.notificationSettings$.pipe(
        skip(1),
        map(notification =>
            OptReducer((state: State) => ({
                ...state,
                notification,
            }))
        )
    );

    const checkboxReducer$ = inputs.checkbox$.pipe(
        map(event =>
            OptReducer((state: State) =>
                produce(state, draft => {
                    const target = event.target as any;
                    const name = target.name as CheckboxKey;
                    const checked = target.checked as boolean;

                    draft.notificationOut[name] = checked;
                })
            )
        )
    );

    const numberFieldReducer$ = inputs.numberField$.pipe(
        map(event =>
            OptReducer((state: State) =>
                produce(state, draft => {
                    const target = event.target as any;
                    const name = target.name as NumberFieldKey;
                    const value = parseInt(target.value as string);

                    draft.notificationOut[name] = value;
                })
            )
        )
    );

    return obsToStream(
        merge(
            initialReducer$,
            runtimeReducer$,
            checkboxReducer$,
            numberFieldReducer$
        )
    );
};

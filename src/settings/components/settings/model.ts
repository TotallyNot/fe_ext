import { default as xs } from "xstream";

import { InitReducer } from "common/state";
import { State as NotificationState } from "./components/notifications/model";

import { Inputs } from "./intent";

export interface State {
    notification?: NotificationState;
}

export const model = (_inputs: Inputs) => {
    const initialReducer$ = xs.of(InitReducer<State>({}));

    return initialReducer$;
};

import { Stream } from "xstream";
import debounce from "xstream/extra/debounce";
import { StateSource, Reducer, withState } from "@cycle/state";
import { mergeSinks } from "cyclejs-utils";

import isolate from "@cycle/isolate";

import { APISource, APIRequest } from "../drivers/apiDriver";
import {
    NotificationSource,
    NotificationActions,
} from "../drivers/notificationDriver";
import { RuntimeSource, RuntimeMessage } from "../drivers/runtimeDriver";

import { APIKey, APIKeyState } from "./APIKey";
import { Notifications, NotificationsState } from "./Notifications";

export interface State {
    apiKey?: APIKeyState;
    notifications?: NotificationsState;
}

export type ChildState<K extends keyof State> = {
    global?: Omit<State, K>;
} & State[K];

export interface Sources {
    state: StateSource<State>;
    api: APISource;
    notifications: NotificationSource;
    runtime: RuntimeSource;
}

export interface Sinks {
    state: Stream<Reducer<unknown>>;
    api: Stream<APIRequest>;
    notifications: Stream<NotificationActions>;
    runtime: Stream<RuntimeMessage>;
}

const stateLens = <K extends keyof State>(key: K) => ({
    get: (state?: State): ChildState<K> | undefined => {
        if (state?.[key]) {
            const { [key]: own, ...global } = state;
            return { global, ...own };
        } else {
            return undefined;
        }
    },
    set: (state?: State, childState?: ChildState<K>): State | undefined => {
        if (childState) {
            const { global: _, ...own } = childState;
            return {
                ...state,
                [key]: own,
            };
        } else {
            return state;
        }
    },
});

const Root = (sources: Sources): Sinks => {
    sources.state.stream.compose(debounce(100)).addListener({
        next: next => console.log(next),
        error: error => console.log(error),
    });

    const apiKeySinks = isolate(APIKey, { state: stateLens("apiKey") })(
        sources
    );

    const notificationsSinks = isolate(Notifications, {
        state: stateLens("notifications"),
    })(sources);

    return mergeSinks([apiKeySinks, notificationsSinks]);
};

export default withState(Root);

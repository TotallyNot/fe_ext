import { Stream, default as xs } from "xstream";
import { StateSource, Reducer, withState } from "@cycle/state";
import { mergeSinks } from "cyclejs-utils";

import isolate from "@cycle/isolate";

import { APISource, APIRequest } from "../drivers/apiDriver";
import {
    NotificationSource,
    NotificationActions,
} from "../drivers/notificationDriver";
import { RuntimeSource, RuntimeMessage } from "../drivers/runtimeDriver";

import { APIKey, State as APIKeyState } from "./APIKey";
import { Notifications, State as NotificationsState } from "./Notifications";

export interface State {
    apiKey?: APIKeyState;
    notifications?: NotificationsState;
}

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

const Root = (sources: Sources): Sinks => {
    sources.state.stream.addListener({
        next: next => console.log(next),
        error: error => console.log(error),
    });

    const apiKeySinks = isolate(APIKey, { state: "apiKey" })(sources);

    const notificationSources = {
        ...sources,
        props: sources.state.stream.map(state => ({
            apiKey: state.apiKey?.key,
        })),
    };
    const notificationsSinks = isolate(Notifications, {
        state: "notifications",
    })(notificationSources);

    const ownSinks = {};

    return mergeSinks([notificationsSinks, apiKeySinks, ownSinks]);
};

export default withState(Root);

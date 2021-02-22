import { Stream, default as xs } from "xstream";
import debounce from "xstream/extra/debounce";
import { StateSource, Reducer, withState } from "@cycle/state";
import { mergeSinks } from "cyclejs-utils";

import isolate from "@cycle/isolate";

import { APISource, APIRequest } from "common/drivers/apiDriver";
import {
    NotificationSource,
    NotificationActions,
} from "../drivers/notificationDriver";
import { RuntimeSource, RuntimeMessage } from "../drivers/runtimeDriver";
import { DBSource, DBAction } from "common/drivers/dbDriver";

import { Notifications, State as NotificationState } from "./Notifications";

export interface State {
    notification?: NotificationState;
}

export interface Sources {
    runtime: RuntimeSource;
    state: StateSource<State>;
    notifications: NotificationSource;
    DB: DBSource;
    api: APISource;
}

export interface Sinks {
    state: Stream<Reducer<unknown>>;
    api: Stream<APIRequest>;
    notifications: Stream<NotificationActions>;
    DB: Stream<DBAction>;
    runtime: Stream<RuntimeMessage>;
}

const Root = (sources: Sources): Sinks => {
    sources.state.stream.compose(debounce(100)).addListener({
        next: next => console.log(next),
        error: error => console.log(error),
    });

    const notificationsSinks = isolate(Notifications, {
        state: "notification",
    })(sources);

    const ownSinks = { DB: xs.empty<DBAction>() };

    return mergeSinks([notificationsSinks, ownSinks]);
};

export default withState(Root);

import isolate from "@cycle/isolate";
import { mergeSinks } from "cyclejs-utils";

import { withState } from "@cycle/state";

import notifications from "./components/notifications";
import user from "./components/user";

import { intent, Sources } from "./intent";
import { model } from "./model";
import { view } from "./view";

const settings = (sources: Sources) => {
    const actions = intent(sources);
    const reducers = model(actions);

    const userSinks = isolate(user, "user")(sources);
    const notificationSinks = isolate(notifications, "notification")(sources);

    const DOM = view(
        sources.state.stream,
        userSinks.DOM,
        notificationSinks.DOM
    );

    // get state stream started :/
    sources.state.stream.endWhen(DOM).addListener({});
    sources.state.stream.addListener({
        next: next => console.log(next),
        error: error => console.log(error),
    });

    const ownSinks = {
        DOM,
        state: reducers,
    };

    return {
        ...mergeSinks([ownSinks, notificationSinks, userSinks]),
        DOM,
    };
};

export default withState(settings);

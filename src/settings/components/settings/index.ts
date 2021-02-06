import dropRepeats from "xstream/extra/dropRepeats";

import { withState } from "@cycle/state";

import { intent, Sources } from "./intent";
import { model } from "./model";
import { view } from "./view";

const settings = (sources: Sources) => {
    const actions = intent(sources);
    const reducers = model(actions);
    const DOM = view(sources.state);

    // get state stream started :/
    sources.state.stream.endWhen(DOM).addListener({});

    return {
        DOM,
        state: reducers.state,
        background: sources.state.stream
            .map(({ notificationOut }) => notificationOut)
            .compose(dropRepeats())
            .map(settings => ({
                kind: "NotificationSettings",
                data: settings,
            })),
    };
};

export default withState(settings);

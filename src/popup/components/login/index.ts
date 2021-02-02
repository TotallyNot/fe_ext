import { withState } from "@cycle/state";

import { intent, Sources } from "./intent";
import { model } from "./model";
import { view } from "./view";

const login = (sources: Sources) => {
    const actions = intent(sources);
    const DOM = view(sources.state);

    // get state stream started :/
    sources.state.stream.endWhen(DOM).addListener({});

    return {
        DOM: DOM,
        state: model(actions).state,
        background: actions.login$.map(key => ({
            kind: "apiKey",
            data: { key },
        })),
        history: actions.loggedIn$,
    };
};

export default withState(login);

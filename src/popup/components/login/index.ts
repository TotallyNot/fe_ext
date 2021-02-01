import xs from "xstream";
import { withState } from "@cycle/state";

import { intent, Sources } from "./intent";
import { model } from "./model";
import { view } from "./view";

const login = (sources: Sources) => {
    const actions = intent(sources);

    return {
        DOM: view(sources.state).DOM,
        state: model(actions).state,
        background: xs
            .combine(actions.input$, actions.login$)
            .map(([key, _]) => ({ kind: "apiKey", data: { key } })),
        history: actions.loggedIn$,
    };
};

export default withState(login);

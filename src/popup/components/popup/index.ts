import { withState } from "@cycle/state";

import { intent, Sources } from "./intent";
import { model } from "./model";
import { view } from "./view";

const popup = (sources: Sources) => {
    const actions = intent(sources);
    const DOM = view(sources.state);

    // get state stream started :/
    sources.state.stream.endWhen(DOM).addListener({});

    return {
        DOM,
        state: model(actions).state,
    };
};

export default withState(popup);

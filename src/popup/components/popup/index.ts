import { withState } from "@cycle/state";

import { intent, Sources } from "./intent";
import { model } from "./model";
import { view } from "./view";

const popup = (sources: Sources) => {
    const actions = intent(sources);
    const reducers = model(actions);
    const DOM = view(sources.state);

    // get state stream started :/
    sources.state.stream.endWhen(DOM).addListener({});

    return {
        DOM,
        state: reducers.state,
    };
};

export default withState(popup);

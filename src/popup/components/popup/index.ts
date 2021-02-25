import { withState } from "@cycle/state";

import { obsToStream } from "common/connect";

import { intent, Sources } from "./intent";
import { model } from "./model";
import { view } from "./view";

const popup = (sources: Sources) => {
    const actions = intent(sources);
    const reducer$ = model(actions);
    const DOM = view(sources.state);

    // get state stream started :/
    sources.state.stream.endWhen(DOM).addListener({});

    return {
        DOM,
        state: obsToStream(reducer$),
    };
};

export default withState(popup);

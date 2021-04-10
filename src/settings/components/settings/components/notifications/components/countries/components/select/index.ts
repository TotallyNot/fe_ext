import { obsToStream } from "common/connect";

import { intent, Sources } from "./intent";
import { model } from "./model";
import { view } from "./view";

export const select = (sources: Sources) => {
    const actions = intent(sources);
    const { selection$, state$ } = model(actions);

    const DOM = obsToStream(view(state$));

    const sinks = {
        DOM,
        selection$,
    };

    return sinks;
};

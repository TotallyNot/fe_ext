import { obsToStream } from "common/connect";

import { Sources, intent } from "./intent";
import { model } from "./model";
import { view } from "./view";

export const user = (sources: Sources) => {
    const inputs = intent(sources);
    const state$ = model(inputs);
    const DOM = obsToStream(view(state$));

    return {
        DOM,
    };
};

export default user;

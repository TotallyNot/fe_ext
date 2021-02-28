import { obsToStream } from "common/connect";

import { intent } from "./intent";
import { view } from "./view";

export const licenses = () => {
    const actions = intent();
    const DOM = obsToStream(view(actions));

    return {
        DOM,
    };
};

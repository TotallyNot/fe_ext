import { obsToStream } from "common/connect";

import { intent } from "./intent";
import { view } from "./view";

const about = () => {
    const inputs = intent();
    const DOM = obsToStream(view(inputs));

    return {
        DOM,
    };
};

export default about;

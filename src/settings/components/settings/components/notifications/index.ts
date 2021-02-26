import { obsToStream } from "common/connect";

import { intent, Sources } from "./intent";
import { model } from "./model";
import { view } from "./view";

const settings = (sources: Sources) => {
    const actions = intent(sources);
    const output = model(actions);
    const DOM = obsToStream(view(output));

    return {
        DOM,
        DB: output.DB,
    };
};

export default settings;

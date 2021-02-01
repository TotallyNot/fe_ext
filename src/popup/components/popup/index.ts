import { Sources, Sinks } from "../types";

import { view } from "./view";

const popup = (_sources: Sources): Partial<Sinks> => {
    return {
        DOM: view(),
    };
};

export default popup;

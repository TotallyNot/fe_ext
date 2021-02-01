import xs from "xstream";
import pluck from "common/xs/pluck";

import { Component } from "common/route";
import { isSome } from "common/types";

import { Sources, Sinks } from "./types";
import { resolve } from "./routes";

const Root: Component<Sources, Sinks> = sources => {
    const root$ = sources.history
        .debug("history")
        .map(location => resolve(location.pathname))
        .map(({ getComponent }) =>
            xs.fromPromise(getComponent().then(component => component(sources)))
        )
        .flatten();

    return {
        DOM: root$
            .compose(pluck("DOM"))
            .filter(isSome)
            .flatten(),
        background: root$
            .compose(pluck("background"))
            .filter(isSome)
            .flatten(),
        history: root$
            .compose(pluck("history"))
            .filter(isSome)
            .flatten(),
    };
};

export default Root;

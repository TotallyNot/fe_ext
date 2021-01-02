import { Stream, default as xs } from "xstream";

import { DOMSource, VNode, div } from "@cycle/dom";

import { BackgroundSource } from "common/drivers/backgroundDriver";
import { ResourceUpdate } from "common/models/runtime";
import { Component } from "common/types";

interface Sources {
    DOM: DOMSource;
    background: BackgroundSource;
}

interface Sinks {
    DOM: Stream<VNode>;
    background: Stream<ResourceUpdate>;
}

export const Root: Component<Sources, Sinks> = sources => {
    const popup$ = sources.background
        .select("apiKey")
        .map(({ key }) => div(key));

    return {
        DOM: popup$,
        background: xs.empty(),
    };
};

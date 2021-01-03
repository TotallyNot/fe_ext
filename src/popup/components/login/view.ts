import { Stream, default as xs } from "xstream";

import { VNode, div, input, button, p } from "@cycle/dom";
import { StateSource } from "@cycle/state";

import { State } from "./model";

interface Sinks {
    DOM: Stream<VNode>;
}

export const view = (model: StateSource<State>): Sinks => {
    const state$ = model.stream;
    return {
        DOM: state$.map(state =>
            div([
                input({ attrs: { type: "text", disabled: state.waiting } }),
                button({ attrs: { disabled: state.waiting } }, "login"),
                state.error
                    ? p(state.message ?? "An unknown error occured!")
                    : undefined,
            ])
        ),
    };
};

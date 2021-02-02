import { input, button, p, form } from "@cycle/dom";
import { StateSource } from "@cycle/state";

import { State } from "./model";

export const view = (model: StateSource<State>) => {
    const state$ = model.stream;
    return state$.map(state =>
        form([
            input({
                attrs: {
                    type: "text",
                    disabled: state.waiting,
                    name: "key",
                },
            }),
            button(
                { attrs: { disabled: state.waiting, type: "submit" } },
                "login"
            ),
            state.error
                ? p(state.message ?? "An unknown error occured!")
                : undefined,
        ])
    );
};

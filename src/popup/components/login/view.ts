import { input, button, p, form, div } from "@cycle/dom";
import { StateSource } from "@cycle/state";

import { style } from "typestyle";
import { vertical, content } from "csstips";

import { outlineButton, textField, error } from "common/styles";

import { State } from "./model";

const column = style(vertical, { alignItems: "center" });
const item = style(content, { margin: 5 });
const errorMessage = style(content, { color: error.toString() });

export const view = (model: StateSource<State>) => {
    const state$ = model.stream;
    return state$.map(state =>
        form({ props: { className: column } }, [
            div({ props: { className: item } }, [
                input({
                    attrs: {
                        type: "text",
                        disabled: state.waiting,
                        name: "key",
                        placeholder: "API key",
                    },
                    props: {
                        className: textField,
                    },
                }),
            ]),
            div({ props: { className: item } }, [
                button(
                    {
                        attrs: {
                            disabled: state.waiting,
                            type: "submit",
                        },
                        props: {
                            className: outlineButton,
                        },
                    },
                    "login"
                ),
            ]),
            state.error
                ? p(
                      { props: { className: errorMessage } },
                      state.message ?? "An unknown error occured!"
                  )
                : null,
        ])
    );
};

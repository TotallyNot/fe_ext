import { default as xs, Stream } from "xstream";
import { form, div, p, input, label, h3, VNode } from "@cycle/dom";
import { StateSource } from "@cycle/state";

import { State } from "./model";

import { style, classes } from "typestyle";
import { flex, vertical, horizontal, width } from "csstips";

import { textField } from "common/styles";

const container = style(vertical, width(400), {
    margin: "0 auto",
});

export const view = (
    state$: Stream<State>,
    user$: Stream<VNode>,
    notification$: Stream<VNode>,
    about$: Stream<VNode>
) =>
    xs
        .combine(state$, user$, notification$, about$)
        .map(([state, userDOM, notificationDOM, about]) =>
            div([userDOM, notificationDOM, about])
        );

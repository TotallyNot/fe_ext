import { div, p, a, span, VNode } from "@cycle/dom";
import { StateSource } from "@cycle/state";

import { browser } from "webextension-polyfill-ts";

import { State } from "./model";

import { classes, style } from "typestyle";
import { flex, vertical, content, horizontal, padding, margin } from "csstips";

import {
    primary,
    allies,
    axis,
    outlineButton,
    box,
    background,
} from "common/styles";

const container = style(vertical, {
    padding: 5,
});
const item = style(flex);
const centerText = style({ textAlign: "center" });
const spacer = style(content, { height: 12 });
const row = style(content, horizontal);
const column = style(flex, vertical, padding(3, 5), margin(0, 5), {
    alignItems: "flex-start",
    $nest: {
        "&:hover": {
            backgroundColor: background.lighten(0.1).toString(),
        },
    },
});
const timerTitle = style(content, margin(0, 0, 3, 0), {
    color: primary.toString(),
    fontSize: 10,
});
const timer = style(content, {
    fontSize: 13,
});
const alliesLabel = style(content, { color: allies.toString() });
const axisLabel = style(content, { color: axis.toString() });

function compactify(nodes: Array<VNode | undefined>): Array<VNode> {
    return nodes.filter(node => node !== undefined) as Array<VNode>;
}

export const view = (model: StateSource<State>) =>
    model.stream.map(state =>
        div(
            { props: { className: container } },
            compactify([
                div({ class: { [spacer]: true } }),
                state.timers &&
                    div({ props: { className: classes(row) } }, [
                        div({ props: { className: classes(column, box) } }, [
                            span({ props: { className: timerTitle } }, "War"),
                            span(
                                { props: { className: timer } },
                                state.timers.war
                            ),
                        ]),
                        div({ props: { className: classes(column, box) } }, [
                            span(
                                { props: { className: timerTitle } },
                                "Training"
                            ),
                            span(
                                { props: { className: timer } },
                                state.timers.training
                            ),
                        ]),
                        div({ props: { className: classes(column, box) } }, [
                            span(
                                { props: { className: timerTitle } },
                                "Reimb."
                            ),
                            span(
                                { props: { className: timer } },
                                state.timers.reimburse
                            ),
                        ]),
                    ]),
                div({ class: { [spacer]: true } }),
                state.user &&
                    div({ props: { className: classes(row) } }, [
                        div({ props: { className: column } }, [
                            span(
                                { props: { className: timerTitle } },
                                "Events"
                            ),
                            span(
                                { props: { className: timer } },
                                state.user.events.toString()
                            ),
                        ]),
                        div({ props: { className: column } }, [
                            span({ props: { className: timerTitle } }, "Queue"),
                            span(
                                { props: { className: timer } },
                                `${state.user.queue}/${state.user.queueSize}`
                            ),
                        ]),
                        div({ props: { className: column } }, [
                            span({ props: { className: timerTitle } }, "Mail"),
                            span(
                                { props: { className: timer } },
                                state.user.mail.toString()
                            ),
                        ]),
                    ]),
                div({ class: { [spacer]: true } }),
                state.country &&
                    div({ props: { className: classes(row) } }, [
                        div({ props: { className: column } }, [
                            span(
                                { props: { className: timerTitle } },
                                `Troops in ${state.country.name}`
                            ),
                        ]),
                    ]),
                state.country &&
                    div({ props: { className: classes(row) } }, [
                        div(
                            { props: { className: classes(item, centerText) } },
                            [
                                span(
                                    { props: { className: alliesLabel } },
                                    "allies: "
                                ),
                                span(
                                    { props: { className: timer } },
                                    state.country.allies.toString()
                                ),
                            ]
                        ),
                        div(
                            { props: { className: classes(item, centerText) } },
                            [
                                span(
                                    { props: { className: axisLabel } },
                                    "axis: "
                                ),
                                span(
                                    { props: { className: timer } },
                                    state.country.axis.toString()
                                ),
                            ]
                        ),
                    ]),
                div({ class: { [spacer]: true } }),
                div({ props: { className: classes(row) } }, [
                    div({ props: { className: item } }),
                    a(
                        {
                            props: {
                                className: outlineButton,
                                href: browser.extension.getURL("settings.html"),
                                target: "_blank",
                            },
                        },
                        "settings"
                    ),
                ]),
            ])
        )
    );

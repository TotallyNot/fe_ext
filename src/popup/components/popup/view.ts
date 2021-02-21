import { div, p, a, span } from "@cycle/dom";
import { StateSource } from "@cycle/state";

import { browser } from "webextension-polyfill-ts";

import { State } from "./model";

import { classes, style } from "typestyle";
import { flex, vertical, content, horizontal } from "csstips";

import { primary, allies, axis, outlineButton } from "common/styles";

const container = style(vertical, {
    padding: 5,
});
const item = style(flex);
const centerText = style({ textAlign: "center" });
const spacer = style(content, { height: 12 });
const row = style(content, horizontal);
const column = style(flex, vertical, { alignItems: "center" });
const timerTitle = style(content, {
    color: primary.toString(),
    marginBottom: 2,
});
const timer = style(content, {
    fontSize: 10,
    fontFamily: "'Monaco', monospace",
});
const alliesLabel = style(content, { color: allies.toString() });
const axisLabel = style(content, { color: axis.toString() });

export const view = (model: StateSource<State>) =>
    model.stream.map(state =>
        div({ props: { className: container } }, [
            div({ class: { [spacer]: true } }),
            div({ props: { className: classes(row) } }, [
                div({ props: { className: column } }, [
                    span({ props: { className: timerTitle } }, "War"),
                    span(
                        { props: { className: timer } },
                        state.timers.war ?? "N/A"
                    ),
                ]),
                div({ props: { className: column } }, [
                    span({ props: { className: timerTitle } }, "Training"),
                    span(
                        { props: { className: timer } },
                        state.timers.statistics ?? "N/A"
                    ),
                ]),
                div({ props: { className: column } }, [
                    span({ props: { className: timerTitle } }, "Reimb."),
                    span({ props: { className: timer } }, "N/A"),
                ]),
            ]),
            div({ class: { [spacer]: true } }),
            div({ props: { className: classes(row) } }, [
                div({ props: { className: column } }, [
                    span({ props: { className: timerTitle } }, "Events"),
                    span(
                        { props: { className: timer } },
                        state.notificationInfo.events.toString()
                    ),
                ]),
                div({ props: { className: column } }, [
                    span({ props: { className: timerTitle } }, "Queue"),
                    span(
                        { props: { className: timer } },
                        `${state.notificationInfo.queue.current}/${state.notificationInfo.queue.size}`
                    ),
                ]),
                div({ props: { className: column } }, [
                    span({ props: { className: timerTitle } }, "Mail"),
                    span(
                        { props: { className: timer } },
                        state.notificationInfo.mail.toString()
                    ),
                ]),
            ]),
            div({ class: { [spacer]: true } }),
            div({ props: { className: classes(row) } }, [
                div({ props: { className: column } }, [
                    span(
                        { props: { className: timerTitle } },
                        `Troops in ${state.notificationInfo.country}`
                    ),
                ]),
            ]),
            div({ props: { className: classes(row) } }, [
                div({ props: { className: classes(item, centerText) } }, [
                    span({ props: { className: alliesLabel } }, "allies: "),
                    span(
                        { props: { className: timer } },
                        state.notificationInfo.units.allies.toString()
                    ),
                ]),
                div({ props: { className: classes(item, centerText) } }, [
                    span({ props: { className: axisLabel } }, "axis: "),
                    span(
                        { props: { className: timer } },
                        state.notificationInfo.units.axis.toString()
                    ),
                ]),
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
    );

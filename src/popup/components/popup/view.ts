import { div, p, a, span } from "@cycle/dom";
import { StateSource } from "@cycle/state";

import { browser } from "webextension-polyfill-ts";

import { State } from "./model";

import { classes, stylesheet } from "typestyle";
import { flex } from "csstips";

const classNames = stylesheet({
    constainer: {
        padding: 5,
        flexWrap: "wrap",
        justifyContent: "space-around",
    },
    fullwidth: { width: "100%" },
    halfwidth: { width: "45%" },
});

export const view = (model: StateSource<State>) =>
    model.stream.map(state =>
        div({ props: { className: classes(flex, classNames.constainer) } }, [
            a(
                {
                    props: {
                        className: classes(classNames.fullwidth, flex),
                        href: browser.extension.getURL("settings.html"),
                        target: "_blank",
                    },
                },
                "settings"
            ),
            span(
                { props: { className: classNames.halfwidth } },
                state.timers.statistics ?? "N/A"
            ),
            span({ props: { className: classNames.halfwidth } }, [
                `training: ${state.timers.statistics}`,
                "   ",
                `${state.notificationInfo.queue.current}/${state.notificationInfo.queue.size}`,
            ]),
            p([
                `${state.notificationInfo.country}: `,
                `allies: ${state.notificationInfo.units.allies} axis: ${state.notificationInfo.units.axis}`,
            ]),
            p(
                `events: ${state.notificationInfo.events} mail: ${state.notificationInfo.mail}`
            ),
        ])
    );

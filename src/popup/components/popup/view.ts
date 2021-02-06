import { div, p, a } from "@cycle/dom";
import { StateSource } from "@cycle/state";

import { browser } from "webextension-polyfill-ts";

import { State } from "./model";

export const view = (model: StateSource<State>) =>
    model.stream.map(state =>
        div([
            a(
                {
                    props: {
                        href: browser.extension.getURL("settings.html"),
                        target: "_blank",
                    },
                },
                "settings"
            ),
            div([
                state.timers.war && p(`war: ${state.timers.war}`),
                state.timers.statistics &&
                    p(`training: ${state.timers.statistics}`),
            ]),
            p(`${state.notificationInfo.country}:`),
            p(
                `allies: ${state.notificationInfo.units.allies} axis: ${state.notificationInfo.units.axis}`
            ),
            p(
                `events: ${state.notificationInfo.events} mail: ${state.notificationInfo.mail}`
            ),
        ])
    );

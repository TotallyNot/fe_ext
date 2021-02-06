import { div, p, input, label, br } from "@cycle/dom";
import { StateSource } from "@cycle/state";

import { State } from "./model";

export const view = (model: StateSource<State>) =>
    model.stream.map(state =>
        div([
            p("Notifications:"),
            input({
                props: {
                    type: "checkbox",
                    id: "events",
                    name: "events",
                },
                attrs: {
                    checked: state.notification.events,
                },
            }),
            label({ props: { for: "events" } }, "events"),
            input({
                props: {
                    type: "checkbox",
                    id: "mail",
                    name: "mail",
                },
                attrs: {
                    checked: state.notification.mail,
                },
            }),
            label({ props: { for: "mail" } }, "mail"),
            input({
                props: {
                    type: "checkbox",
                    id: "war",
                    name: "war",
                },
                attrs: {
                    checked: state.notification.war,
                },
            }),
            label({ props: { for: "war" } }, "events"),
            input({
                props: {
                    type: "checkbox",
                    id: "training",
                    name: "training",
                },
                attrs: {
                    checked: state.notification.statistic,
                },
            }),
            label({ props: { for: "training" } }, "training"),
            br(),
            input({
                props: {
                    type: "checkbox",
                    id: "troops",
                    name: "troops",
                },
                attrs: {
                    checked: state.notification.troops.active,
                },
            }),
            label({ props: { for: "troops" } }, "troops"),
            input({
                props: {
                    type: "checkbox",
                    id: "troopsAllies",
                    name: "troopsAllies",
                },
                attrs: {
                    checked: state.notification.troops.allies,
                    disabled: !state.notification.troops.active,
                },
            }),
            label({ props: { for: "troopsAllies" } }, "allies"),
            input({
                props: {
                    type: "checkbox",
                    id: "troopsAxis",
                    name: "troopsAxis",
                },
                attrs: {
                    checked: state.notification.troops.axis,
                    disabled: !state.notification.troops.active,
                },
            }),
            label({ props: { for: "troopsAllies" } }, "axis"),
            br(),
            label({ props: { for: "troopsCooldown" } }, "cooldown"),
            input({
                props: {
                    type: "number",
                    id: "troopsCooldown",
                    name: "troopsCooldown",
                },
                attrs: {
                    value: state.notification.troops.cooldown,
                    disabled: !state.notification.troops.active,
                },
            }),
        ])
    );

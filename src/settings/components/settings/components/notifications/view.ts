import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { VNode, div, input, label, h3, h4, p } from "@cycle/dom";
import { style, classes } from "typestyle";
import { vertical, flex, width, padding, margin, horizontal } from "csstips";

import { textField, background } from "common/styles";

import { State } from "./model";

const container = style(vertical, width(400), padding(0, 10));

const item = style(horizontal, {
    alignItems: "center",
    $nest: {
        "input[type=checkbox]": {
            marginRight: 5,
        },
        "input[type=number]": {
            marginLeft: 5,
        },
        "&:not(:last-child)": {
            marginBottom: 10,
        },
    },
});

const checkboxRow = classes(
    item,
    style({
        $nest: {
            label: {
                marginRight: 15,
            },
        },
    })
);

const section = style(margin(5, 0, 10, 0));

const subSection = style(margin(3, 0, 7, 0));

const box = classes(
    style(padding(10, 15), vertical, flex, {
        backgroundColor: background.lighten(0.05).toString(),
    })
);

export const view = (state$: Observable<State>): Observable<VNode> =>
    state$.pipe(
        map(state =>
            div({ attrs: { class: container } }, [
                h3({ attrs: { class: section } }, "Notifications"),
                div({ attrs: { class: item } }, [
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
                    label({ attrs: { for: "events" } }, "Events"),
                ]),
                div({ attrs: { class: item } }, [
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
                    label({ attrs: { for: "mail" } }, "Mail"),
                ]),

                h4({ attrs: { class: subSection } }, "Timers"),
                div({ attrs: { class: item } }, [
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
                    label({ attrs: { for: "war" } }, "War / travel"),
                ]),

                div({ attrs: { class: item } }, [
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
                    label({ attrs: { for: "training" } }, "Training queue"),
                ]),

                h4({ attrs: { class: subSection } }, "Unit notifications"),
                div({ attrs: { class: item } }, [
                    input({
                        props: {
                            type: "checkbox",
                            id: "troops",
                            name: "troops",
                        },
                        attrs: {
                            checked: state.notification.troops,
                        },
                    }),
                    label(
                        { attrs: { for: "troops" } },
                        "For the user's location"
                    ),
                ]),

                div({ attrs: { class: box } }, [
                    div({ attrs: { class: checkboxRow } }, [
                        input({
                            props: {
                                type: "checkbox",
                                id: "troopsAllies",
                                name: "troopsAllies",
                            },
                            attrs: {
                                checked: state.notification.troopsAllies,
                                disabled: !state.notification.troops,
                            },
                        }),
                        label({ attrs: { for: "troopsAllies" } }, "Allies"),
                        input({
                            props: {
                                type: "checkbox",
                                id: "troopsAxis",
                                name: "troopsAxis",
                            },
                            attrs: {
                                checked: state.notification.troopsAxis,
                                disabled: !state.notification.troops,
                            },
                        }),
                        label({ attrs: { for: "troopsAxis" } }, "Axis"),
                    ]),
                    div({ attrs: { class: item } }, [
                        label(
                            { attrs: { for: "troopsCooldown" } },
                            "Cooldown (in seconds):"
                        ),
                        input({
                            props: {
                                type: "number",
                                id: "troopsCooldown",
                                name: "troopsCooldown",
                                className: textField,
                            },
                            attrs: {
                                value: state.notification.troopsCooldown,
                                disabled: !state.notification.troops,
                            },
                        }),
                    ]),
                ]),
            ])
        )
    );

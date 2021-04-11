import { div, input, span, label, i, VNode } from "@cycle/dom";
import { Observable, combineLatest } from "rxjs";
import { map } from "rxjs/operators";

import { style, classes } from "typestyle";
import { horizontal, flex1, margin, width } from "csstips";

import {
    textField,
    primary,
    text,
    box,
    item,
    checkboxRow,
    inlineInput,
} from "common/styles";

import times from "@fortawesome/fontawesome-free/svgs/solid/times.svg";

import { StateStream } from "./model";

const row = style(
    horizontal,
    width("calc(100% + 25px)"),
    margin(-5, -15, 15, -10)
);

const close = style(
    {
        background: `url(${times}) no-repeat top left`,
        filter: "invert(100%)",
    },
    width(20)
);

const iconButton = style({
    $nest: {
        "&:hover": {
            filter: "invert(60%)",
            cursor: "pointer",
        },
    },
});

const header = style(flex1, {
    flexGrow: 1,
    color: primary.toHexString(),
    fontSize: 15,
});

export const view = (
    state$: StateStream,
    selectDOM$: Observable<VNode>
): Observable<VNode> =>
    combineLatest([state$, selectDOM$]).pipe(
        map(([state, selectDOM]) =>
            div([
                div({ attrs: { class: item } }, [
                    label(["For country:", selectDOM]),
                ]),
                ...state.countries.map(country =>
                    div({ attrs: { class: classes(box, item) } }, [
                        div({ attrs: { class: row } }, [
                            span(
                                { attrs: { class: header } },
                                `${country.name}:`
                            ),
                            i({
                                attrs: {
                                    class: classes(close, iconButton, "close"),
                                },
                                dataset: { id: country.id },
                            }),
                        ]),
                        div({ attrs: { class: checkboxRow } }, [
                            label([
                                input({
                                    props: {
                                        type: "checkbox",
                                        checked: country.allies,
                                    },
                                    dataset: {
                                        type: "allies",
                                        id: country.id,
                                    },
                                }),
                                "Allies",
                            ]),
                            label([
                                input({
                                    props: {
                                        type: "checkbox",
                                        checked: country.axis,
                                    },
                                    dataset: {
                                        type: "axis",
                                        id: country.id,
                                    },
                                }),
                                "Axis",
                            ]),
                        ]),
                        div({ attrs: { class: item } }, [
                            input({
                                props: {
                                    type: "checkbox",
                                    checked: country.cooldown.active,
                                },
                                dataset: {
                                    type: "cooldownActive",
                                    id: country.id,
                                },
                            }),
                            label([
                                "Cooldown between alerts:",
                                input({
                                    attrs: {
                                        class: classes(
                                            textField,
                                            inlineInput,
                                            "cooldown"
                                        ),
                                        value: country.cooldown.seconds,
                                        type: "number",
                                        min: 0,
                                        disabled: !country.cooldown.active,
                                    },
                                    dataset: {
                                        id: country.id,
                                    },
                                }),
                                "seconds",
                            ]),
                        ]),
                    ])
                ),
            ])
        )
    );

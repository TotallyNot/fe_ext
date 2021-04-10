import { div, input, span, label, VNode } from "@cycle/dom";
import { Observable, combineLatest } from "rxjs";
import { map } from "rxjs/operators";

import { style, classes } from "typestyle";
import { horizontal, flex1, margin, width } from "csstips";

import {
    textField,
    primary,
    box,
    item,
    checkboxRow,
    inlineInput,
} from "common/styles";

import { StateStream } from "./model";

const row = style(
    horizontal,
    width("calc(100% + 20px)"),
    margin(-5, -10, 15, -10)
);

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
                            span("x"),
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

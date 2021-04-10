import { div, input, span, label, VNode } from "@cycle/dom";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { style, classes } from "typestyle";
import { block, none, vertical, padding, width } from "csstips";

import { textField, background, text } from "common/styles";

import { StateStream } from "./model";

const countriesContainer = style({ position: "relative" });
const countriesInput = style(width(300), {
    $nest: {
        "&:focus": {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
        },
    },
});

const hidden = style(none);
const visible = style(block);

const suggestions = style(width(300), {
    maxHeight: 200,
    overflow: "scroll",
    position: "absolute",
    backgroundColor: background.darken(0.08).toHexString(),
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
});
const suggestion = style(vertical, padding(7, 10), {
    $nest: {
        "&:hover": {
            backgroundColor: background.darken(0.04).toHexString(),
        },
    },
});

const caption = style({
    fontSize: 12,
    color: text.darken(0.2).toHexString(),
});

export const view = (state$: StateStream): Observable<VNode> =>
    state$.pipe(
        map(({ text, focus, options }) =>
            div({ attrs: { class: countriesContainer } }, [
                input({
                    attrs: {
                        class: classes(textField, countriesInput, "search"),
                        value: text,
                    },
                }),
                div(
                    {
                        attrs: {
                            class: classes(
                                focus ? visible : hidden,
                                suggestions
                            ),
                        },
                    },
                    options.map(option =>
                        div(
                            {
                                attrs: {
                                    class: classes(suggestion, "suggestion"),
                                },
                                dataset: {
                                    key: option.key,
                                    name: option.name,
                                },
                            },
                            [
                                span(option.name),
                                span(
                                    { attrs: { class: caption } },
                                    option.caption
                                ),
                            ]
                        )
                    )
                ),
            ])
        )
    );

import { map } from "rxjs/operators";

import { h3, h4, p, div, a } from "@cycle/dom";

import { style } from "typestyle";

import { Inputs } from "./intent";

import { container, section, subSection, primary } from "common/styles";

const link = style({
    color: primary.toString(),
    textDecoration: "none",
    $nest: {
        "&:hover": {
            color: primary.lighten(0.05).toString(),
        },
        "&:active": {
            color: primary.darken(0.05).toString(),
        },
    },
});

export const view = (inputs: Inputs) =>
    inputs.manifest$.pipe(
        map(manifest =>
            div({ attrs: { class: container } }, [
                h3({ attrs: { class: section } }, "About"),
                h4(
                    { attrs: { class: subSection } },
                    `Version: v${manifest.version}`
                ),
                h4({ attrs: { class: subSection } }, [
                    "Source code: ",
                    a(
                        {
                            attrs: {
                                class: link,
                                href: "https://github.com/TotallyNot/fe_ext",
                                target: "_blank",
                            },
                        },
                        "GitHub"
                    ),
                ]),
                p(
                    "This software is distributed under the BSD 3-clause license."
                ),
                a(
                    {
                        attrs: {
                            class: link,
                            href: "/acknowledgements.html",
                            target: "_blank",
                        },
                    },
                    "Open Source License Acknowledgements"
                ),
            ])
        )
    );

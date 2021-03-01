import { map } from "rxjs/operators";

import { div, p, h1, h2 } from "@cycle/dom";

import { Inputs } from "./intent";

export const view = (inputs: Inputs) =>
    inputs.licenses$.pipe(
        map(licenses =>
            div([
                h1("Open Source License Acknowledgements"),
                p(
                    "(name pending) utilizes third-party open source software subject to the licenses described below."
                ),

                ...licenses.map(license =>
                    div([
                        h2(license.name),
                        p(
                            `${license.name}@${license.version} ${
                                license.author ? `by ${license.author} ` : ""
                            } is licensed under the ${license.license} license.`
                        ),
                        license.licenseText && p(license.licenseText),
                    ])
                ),
            ])
        )
    );

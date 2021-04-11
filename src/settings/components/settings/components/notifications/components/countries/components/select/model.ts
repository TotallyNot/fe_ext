import { combineLatest, merge } from "rxjs";
import { map, mapTo } from "rxjs/operators";

import { Inputs } from "./intent";

export const model = (inputs: Inputs) => {
    const value$ = merge(inputs.text$, inputs.selection$.pipe(mapTo("")));
    const filtered$ = combineLatest([inputs.options$, value$]).pipe(
        map(([options, search]) =>
            options.filter(
                option =>
                    option.name
                        .toLowerCase()
                        .startsWith(search.toLowerCase()) ||
                    option.caption
                        .toLowerCase()
                        .startsWith(search.toLowerCase())
            )
        )
    );

    const state$ = combineLatest([value$, inputs.focused$, filtered$]).pipe(
        map(([text, focus, options]) => ({
            text,
            focus,
            options,
        }))
    );

    return {
        state$,
        selection$: inputs.selection$,
    };
};

export type Outputs = ReturnType<typeof model>;
export type StateStream = Outputs["state$"];

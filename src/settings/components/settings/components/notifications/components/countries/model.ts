import { Observable, combineLatest, of } from "rxjs";
import { map } from "rxjs/operators";

import { Inputs } from "./intent";

interface Country {
    id: string;
    name: string;

    allies: boolean;
    axis: boolean;
    cooldown: {
        active: boolean;
        seconds: number;
    };
}

export const model = (
    inputs: Inputs,
    selection$: Observable<{ key: string; name: string }>
) => {
    const countries$ = of<Country[]>([
        {
            id: "1",
            name: "France",
            allies: true,
            axis: true,
            cooldown: { active: false, seconds: 0 },
        },
    ]);

    const state$ = countries$.pipe(map(countries => ({ countries })));

    const selectProps$ = inputs.countries$.pipe(
        map(countries => ({
            options: countries
                .map(country => ({
                    key: country.id,
                    name: country.name,
                    caption: country.code.toUpperCase(),
                }))
                .sort((a, b) => parseInt(a.key) - parseInt(b.key)),
        }))
    );

    return {
        state$,
        selectProps$,
    };
};

export type Outputs = ReturnType<typeof model>;
export type StateStream = Outputs["state$"];

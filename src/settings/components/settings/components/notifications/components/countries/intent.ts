import { merge, race, timer } from "rxjs";
import {
    switchMap,
    filter,
    map,
    mapTo,
    first,
    startWith,
} from "rxjs/operators";

import { MainDOMSource } from "@cycle/dom";

import { DBSource } from "common/drivers/dbDriver";

import { streamToObs } from "common/connect";

export interface Sources {
    DOM: MainDOMSource;
    DB: DBSource;
}

export const intent = (sources: Sources) => {
    const countries$ = sources.DB.db$.pipe(
        switchMap(db => db.country.find().exec()),
        filter(countries => countries.length > 0),
        map(countries =>
            countries.map(({ id, name, code }) => ({ id, name, code }))
        ),
        first(),
        startWith([] as { id: string; name: string; code: string }[])
    );

    return {
        countries$,
    };
};

export type Inputs = ReturnType<typeof intent>;

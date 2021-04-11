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
import { isSome } from "common/types";

export interface Sources {
    DOM: MainDOMSource;
    DB: DBSource;
}

export const intent = (sources: Sources) => {
    const countryList$ = sources.DB.db$.pipe(
        switchMap(db => db.country.find().exec()),
        filter(countries => countries.length > 0),
        map(countries =>
            countries.map(({ id, name, code }) => ({ id, name, code }))
        ),
        first(),
        startWith([] as { id: string; name: string; code: string }[])
    );

    const user$ = sources.DB.db$.pipe(
        switchMap(
            db =>
                db.player.findOne({
                    selector: {
                        user: {
                            $exists: true,
                        },
                    },
                }).$
        ),
        filter(isSome)
    );

    const remove$ = streamToObs(
        sources.DOM.select(".close").events("click")
    ).pipe(map((event: any) => event.target.dataset.id as string));

    const toggled$ = streamToObs(
        sources.DOM.select(`input[type="checkbox"]`).events("change")
    ).pipe(
        map((event: any) => ({
            value: event.target.checked as boolean,
            id: event.target.dataset.id as string,
            type: event.target.dataset.type as string,
        }))
    );

    const cooldown$ = streamToObs(
        sources.DOM.select(".cooldown").events("change")
    ).pipe(
        map((event: any) => ({
            value: event.target.value as string,
            id: event.target.dataset.id as string,
        }))
    );

    return {
        countryList$,
        user$,
        remove$,
        toggled$,
        cooldown$,
    };
};

export type Inputs = ReturnType<typeof intent>;

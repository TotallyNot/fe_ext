import { merge, race, timer, Observable } from "rxjs";
import {
    switchMap,
    filter,
    map,
    mapTo,
    pluck,
    startWith,
} from "rxjs/operators";

import { MainDOMSource } from "@cycle/dom";

import { streamToObs } from "common/connect";

export interface Props {
    options: {
        key: string;
        name: string;
        caption: string;
    }[];
}

export interface Sources {
    DOM: MainDOMSource;
    props$: Observable<Props>;
}

export const intent = (sources: Sources) => {
    const options$ = sources.props$.pipe(pluck("options"));

    const text$ = streamToObs(
        sources.DOM.select(".search").events("input")
    ).pipe(
        map(event => (event.target as any).value as string),
        startWith("")
    );

    const selection$ = streamToObs(
        sources.DOM.select(".suggestion").events("click")
    ).pipe(
        map((event: any) => ({
            key: event.ownerTarget.dataset.key as string,
            name: event.ownerTarget.dataset.name as string,
        }))
    );

    const mouseDown$ = streamToObs(
        sources.DOM.select(".suggestion").events("mousedown")
    );

    const unfocused$ = streamToObs(
        sources.DOM.select(".search").events("blur")
    ).pipe(
        switchMap(() => race(timer(200), mouseDown$)),
        filter(next => next === 0),
        mapTo(false)
    );

    const focus$ = streamToObs(
        sources.DOM.select(".search").events("focus")
    ).pipe(mapTo(true));

    const focused$ = merge(
        unfocused$,
        selection$.pipe(mapTo(false)),
        focus$
    ).pipe(startWith(false));

    return {
        options$,
        text$,
        focused$,
        selection$,
    };
};

export type Inputs = ReturnType<typeof intent>;

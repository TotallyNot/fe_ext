import { switchMap, share, map } from "rxjs/operators";

import { streamToObs } from "common/connect";

import { MainDOMSource } from "@cycle/dom";
import { DBSource } from "common/drivers/dbDriver";
import { APISource } from "common/drivers/apiDriver";

export interface Sources {
    DOM: MainDOMSource;
    DB: DBSource;
    API: APISource;
}

export const intent = (sources: Sources) => {
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
        share()
    );

    sources.DOM._isolateModule;

    const logout$ = streamToObs(sources.DOM.select(".logout").events("click"));
    const login$ = streamToObs(sources.DOM.select(".login").events("click"));
    const apiKey$ = streamToObs(
        sources.DOM.select("#apiKey").events("blur")
    ).pipe(map(event => (event.target as any).value as string));

    const response$ = streamToObs(sources.API.response("user"));

    return {
        user$,
        logout$,
        login$,
        response$,
        apiKey$,
    };
};

export type Inputs = ReturnType<typeof intent>;

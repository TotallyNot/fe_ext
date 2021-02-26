import { switchMap, map, share } from "rxjs/operators";

import { MainDOMSource } from "@cycle/dom";

import { streamToObs } from "common/connect";

import { DBSource } from "common/drivers/dbDriver";

export interface Sources {
    DOM: MainDOMSource;
    DB: DBSource;
}

export const intent = (sources: Sources) => {
    const checkbox$ = streamToObs(
        sources.DOM.select("input[type=checkbox]").events("change")
    );

    const numberField$ = streamToObs(
        sources.DOM.select("input[type=number]").events("change")
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
        share()
    );

    const settings$ = user$.pipe(map(result => result?.settings?.notification));

    return {
        checkbox$,
        numberField$,
        settings$,
        user$,
    };
};

export type Inputs = ReturnType<typeof intent>;

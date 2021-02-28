import { switchMap, share } from "rxjs/operators";

import { MainDOMSource } from "@cycle/dom";
import { DBSource } from "common/drivers/dbDriver";

export interface Sources {
    DOM: MainDOMSource;
    DB: DBSource;
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

    const logout$ = sources.DOM.select(".logout").events("click");

    return {
        user$,
        logout$,
    };
};

export type Inputs = ReturnType<typeof intent>;

import { switchMap, filter } from "rxjs/operators";

import { MainDOMSource } from "@cycle/dom";
import { StateSource } from "@cycle/state";

import { BackgroundSource } from "common/drivers/backgroundDriver";
import { DBSource } from "common/drivers/dbDriver";
import { isSome } from "common/types";

import { State } from "./model";

export interface Sources {
    DOM: MainDOMSource;
    background: BackgroundSource;
    state: StateSource<State>;
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
        filter(isSome)
    );

    const country$ = sources.DB.db$.pipe(
        switchMap(
            db =>
                db.country.findOne({
                    selector: {
                        current: true,
                    },
                }).$
        ),
        filter(isSome)
    );

    return {
        user$,
        country$,
    };
};

export type Inputs = ReturnType<typeof intent>;

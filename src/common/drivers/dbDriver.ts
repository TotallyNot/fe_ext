import { Observable, asyncScheduler, from } from "rxjs";
import {
    withLatestFrom,
    mergeMap,
    retryWhen,
    throttleTime,
    shareReplay,
} from "rxjs/operators";

import { Stream } from "xstream";

import { streamToObs } from "common/connect";
import { makeDB, Database } from "common/models/db";

export type DBAction = (db: Database) => Promise<unknown>;

export class DBSource {
    db$: Observable<Database>;

    constructor(action$: Stream<DBAction>) {
        console.log("db driver");
        this.db$ = from(makeDB()).pipe(shareReplay(1));

        streamToObs(action$)
            .pipe(
                withLatestFrom(this.db$),
                mergeMap(([action, db]) => from(action(db))),
                retryWhen(error$ =>
                    error$.pipe(
                        throttleTime(30000, asyncScheduler, {
                            leading: true,
                            trailing: true,
                        })
                    )
                )
            )
            .subscribe();
    }
}

export const makeDBDriver = () => (action$: Stream<DBAction>) =>
    new DBSource(action$);

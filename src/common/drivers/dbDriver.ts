import { Observable, ReplaySubject, from } from "rxjs";
import { refCount, multicast, withLatestFrom, mergeMap } from "rxjs/operators";

import { Stream } from "xstream";

import { streamToObs } from "common/connect";
import { makeDB, Database } from "common/models/db";

export type DBAction = (db: Database) => Promise<unknown>;

export class DBSource {
    db$: Observable<Database>;

    constructor(action$: Stream<DBAction>) {
        console.log("db driver");
        this.db$ = from(makeDB()).pipe(
            multicast(() => new ReplaySubject<Database>(1)),
            refCount()
        );

        streamToObs(action$)
            .pipe(
                withLatestFrom(this.db$),
                mergeMap(([action, db]) => from(action(db)))
            )
            .subscribe();
    }
}

export const makeDBDriver = () => (action$: Stream<DBAction>) =>
    new DBSource(action$);

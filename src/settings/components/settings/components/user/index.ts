import { merge, Observable } from "rxjs";
import { mapTo, map, withLatestFrom, filter } from "rxjs/operators";

import { obsToStream } from "common/connect";
import { isSuccess } from "common/types";

import { DBAction } from "common/drivers/dbDriver";
import { APIRequest } from "common/drivers/apiDriver";

import { Sources, intent } from "./intent";
import { model } from "./model";
import { view } from "./view";

export const user = (sources: Sources) => {
    const inputs = intent(sources);
    const state$ = model(inputs);
    const DOM = obsToStream(view(state$));

    const logout$: Observable<DBAction> = inputs.logout$.pipe(
        mapTo(db =>
            db.player
                .findOne({
                    selector: {
                        user: {
                            $exists: true,
                        },
                    },
                })
                .exec()
                .then(record =>
                    record?.atomicUpdate(old => {
                        delete old.user;
                        return old;
                    })
                )
        )
    );

    const success$: Observable<DBAction> = inputs.response$.pipe(
        filter(isSuccess),
        withLatestFrom(inputs.apiKey$),
        map(([{ data }, apiKey]) => db =>
            db.player
                .findOne(data.id)
                .exec()
                .then(record =>
                    record
                        ? record.atomicPatch({
                              user: { apiKey },
                          })
                        : db.player.insert({
                              id: data.id,
                              name: data.name,
                              team: data.team,
                              user: {
                                  apiKey,
                              },
                          })
                )
        )
    );

    const loginRequest$: Observable<APIRequest> = inputs.login$.pipe(
        withLatestFrom(inputs.apiKey$),
        map(([_, apiKey]) => ({ apiKey, selection: "user" }))
    );

    const API = obsToStream(loginRequest$);
    const DB = obsToStream(merge(logout$, success$));

    return {
        DOM,
        API,
        DB,
    };
};

export default user;

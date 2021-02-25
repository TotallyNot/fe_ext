import { Stream, default as xs } from "xstream";
import debounce from "xstream/extra/debounce";

import { Observable } from "rxjs";
import {
    switchMap,
    map,
    filter,
    pluck,
    switchMapTo,
    first,
} from "rxjs/operators";

import { StateSource, Reducer, withState } from "@cycle/state";
import { mergeSinks } from "cyclejs-utils";

import isolate from "@cycle/isolate";

import { APISource, APIRequest } from "common/drivers/apiDriver";
import {
    NotificationSource,
    NotificationActions,
} from "../drivers/notificationDriver";
import { RuntimeSource, RuntimeMessage } from "../drivers/runtimeDriver";
import { DBSource, DBAction } from "common/drivers/dbDriver";

import { obsToStream, streamToObs } from "common/connect";
import { isSome, isSuccess } from "common/types";

import { Notifications, State as NotificationState } from "./Notifications";

export interface State {
    notification?: NotificationState;
}

export interface Sources {
    runtime: RuntimeSource;
    state: StateSource<State>;
    notifications: NotificationSource;
    DB: DBSource;
    api: APISource;
}

export interface Sinks {
    state: Stream<Reducer<unknown>>;
    api: Stream<APIRequest>;
    notifications: Stream<NotificationActions>;
    DB: Stream<DBAction>;
    runtime: Stream<RuntimeMessage>;
}

const Root = (sources: Sources): Sinks => {
    if (__DEBUG__) {
        sources.state.stream.compose(debounce(100)).addListener({
            next: console.log,
            error: console.log,
        });
    }

    const apiKey$ = sources.DB.db$.pipe(
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
        filter(isSome),
        pluck("user"),
        filter(isSome),
        pluck("apiKey")
    );

    const request$ = sources.DB.db$.pipe(
        switchMap(db => db.country.find().$),
        filter(results => results.length === 0),
        switchMapTo(
            apiKey$.pipe(
                first(),
                map((apiKey): APIRequest => ({ apiKey, selection: "world" }))
            )
        )
    );

    const response$ = streamToObs(sources.api.response("world"));

    const update$: Observable<DBAction> = response$.pipe(
        filter(isSuccess),
        map(({ data }) => db =>
            db.country.bulkInsert(
                data.map(country => ({
                    id: country.id,
                    code: country.code,
                    name: country.name,
                    region: country.region,

                    land: country.land,
                    coastline: country.coastline,
                    coordinates: country.coordinates,

                    current: false,
                }))
            )
        )
    );

    const notificationsSinks = isolate(Notifications, {
        state: "notification",
    })(sources);

    const ownSinks = { DB: obsToStream(update$), api: obsToStream(request$) };

    return mergeSinks([notificationsSinks, ownSinks]);
};

export default withState(Root);

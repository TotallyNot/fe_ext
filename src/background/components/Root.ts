import { Stream } from "xstream";

import { Observable, merge, interval } from "rxjs";
import {
    switchMap,
    map,
    mapTo,
    filter,
    pluck,
    switchMapTo,
    first,
    share,
    startWith,
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

import { Notifications, State as NotificationState } from "./notification";

import { CountryEventSchema } from "common/models/db/countryEvent/schema";

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
    /*
    if (__DEBUG__) {
        sources.state.stream.compose(debounce(100)).addListener({
            next: console.log,
            error: console.log,
        });
    }
    */
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

    const apiKey$ = user$.pipe(
        filter(isSome),
        pluck("user"),
        filter(isSome),
        pluck("apiKey")
    );

    const logout$ = streamToObs(sources.api.errors()).pipe(
        filter(error => error.data.code === 1),
        mapTo<{}, DBAction>(db =>
            db.player
                .findOne({
                    selector: {
                        user: {
                            $exists: true,
                        },
                    },
                })
                .exec()
                .then(player =>
                    player?.atomicUpdate(old => {
                        delete old.user;
                        return old;
                    })
                )
        )
    );

    const standardSettings$ = user$.pipe(
        filter(isSome),
        filter(user => !user.settings),
        map(
            (user): DBAction => () =>
                user.atomicPatch({
                    settings: {
                        notification: {
                            refreshPeriod: 30,
                            world: true,
                            war: true,
                            event: true,
                            mail: true,
                            training: true,
                            reimburse: true,

                            userLocationActive: true,
                            userLocation: {
                                allies: true,
                                axis: true,

                                cooldown: 60,
                                cooldownActive: false,
                            },
                        },
                    },
                })
        )
    );

    const notificationsSinks = isolate(Notifications, {
        state: "notification",
    })(sources);

    const ownSinks = {
        DB: obsToStream(merge(standardSettings$, logout$)),
    };

    return mergeSinks([notificationsSinks, ownSinks]);
};

export default withState(Root);

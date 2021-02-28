import { Stream, default as xs } from "xstream";

import { timer, EMPTY, combineLatest, merge, Observable } from "rxjs";
import {
    switchMap,
    map,
    mapTo,
    filter,
    pluck,
    tap,
    share,
    shareReplay,
    distinctUntilChanged,
} from "rxjs/operators";

import { Reducer, StateSource } from "@cycle/state";

import { mergeSinks } from "cyclejs-utils";

import produce from "immer";

import { obsToStream, streamToObs } from "common/connect";

import { Component, isSome, isSuccess } from "common/types";
import { OptReducer, InitReducer } from "common/state";

import { APISource, APIRequest } from "common/drivers/apiDriver";
import { DBSource, DBAction } from "common/drivers/dbDriver";
import { RuntimeSource, RuntimeMessage } from "../drivers/runtimeDriver";
import {
    NotificationSource,
    NotificationActions,
} from "../drivers/notificationDriver";

import event from "./Event";
import mail from "./Mail";
import training from "./Statistic";
import unit from "./Troops";
import war from "./War";

import { PlayerDocType } from "common/models/db/player/types";

export type ChildProps = {
    settings$: Observable<Required<PlayerDocType>["settings"]["notification"]>;
};

export interface State {
    requests: {
        notifications?: {
            timestamp: number;
        };
        country?: {
            timestamp: number;
        };
        world?: {
            timestamp: number;
        };
        user?: {
            timestamp: number;
        };
    };
}

interface Sources {
    state: StateSource<State | undefined>;
    api: APISource;
    runtime: RuntimeSource;
    notifications: NotificationSource;
    DB: DBSource;
}

interface Sinks {
    state: Stream<Reducer<unknown>>;
    api: Stream<APIRequest>;
    runtime: Stream<RuntimeMessage>;
    notifications: Stream<NotificationActions>;
}

function delayTime(period: number, timestamp?: number): number {
    if (!timestamp) {
        return 0;
    } else {
        return Math.max(0, 1000 * period + timestamp - Date.now());
    }
}

export const Notifications: Component<Sources, Sinks> = sources => {
    const state$ = streamToObs(sources.state.stream).pipe(
        filter(isSome),
        shareReplay(1)
    );

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
        map(player => player?.user?.apiKey),
        distinctUntilChanged(),
        shareReplay(1)
    );

    const notificationTimestamp$ = state$.pipe(
        pluck("requests", "notifications"),
        map(state => state?.timestamp)
    );

    const countryTimestamp$ = state$.pipe(
        pluck("requests", "country"),
        map(state => state?.timestamp)
    );

    const worldTimestamp$ = state$.pipe(
        pluck("requests", "world"),
        map(state => state?.timestamp)
    );

    const userTimestamp$ = state$.pipe(
        pluck("requests", "user"),
        map(state => state?.timestamp)
    );

    const settings$ = sources.DB.db$.pipe(
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
        map(doc => doc?.settings?.notification),
        filter(isSome),
        share()
    );

    const refreshPeriod$ = settings$.pipe(
        pluck("refreshPeriod"),
        distinctUntilChanged()
    );

    const notificationRequest$ = combineLatest(
        apiKey$,
        refreshPeriod$,
        notificationTimestamp$
    ).pipe(
        switchMap(([apiKey, period, timestamp]) =>
            apiKey
                ? timer(delayTime(period, timestamp)).pipe(
                      mapTo<{}, APIRequest>({
                          apiKey,
                          selection: "notifications",
                      })
                  )
                : EMPTY
        ),
        shareReplay(1)
    );

    const countryRequest$ = combineLatest(
        apiKey$,
        refreshPeriod$,
        countryTimestamp$
    ).pipe(
        switchMap(([apiKey, period, timestamp]) =>
            apiKey
                ? timer(delayTime(period, timestamp)).pipe(
                      mapTo<{}, APIRequest>({
                          apiKey,
                          selection: "country",
                      })
                  )
                : EMPTY
        ),
        shareReplay(1)
    );

    const worldRequest$ = combineLatest(
        apiKey$,
        refreshPeriod$,
        worldTimestamp$
    ).pipe(
        switchMap(([apiKey, period, timestamp]) =>
            apiKey
                ? timer(delayTime(period, timestamp)).pipe(
                      mapTo<{}, APIRequest>({
                          apiKey,
                          selection: "world",
                      })
                  )
                : EMPTY
        ),
        shareReplay(1)
    );

    const userRequest$ = combineLatest(
        apiKey$,
        refreshPeriod$,
        userTimestamp$
    ).pipe(
        switchMap(([apiKey, period, timestamp]) =>
            apiKey
                ? timer(delayTime(period, timestamp)).pipe(
                      mapTo<{}, APIRequest>({
                          apiKey,
                          selection: "user",
                      })
                  )
                : EMPTY
        ),
        shareReplay(1)
    );

    const request$ = merge(
        notificationRequest$,
        countryRequest$,
        worldRequest$,
        userRequest$
    );

    const initialReducer$ = xs.of(
        InitReducer<State>({
            requests: {},
        })
    );

    const sentNotificationReducer$ = obsToStream(notificationRequest$).mapTo(
        OptReducer((prevState: State) =>
            produce(prevState, draft => {
                draft.requests.notifications = {
                    timestamp: Date.now(),
                };
            })
        )
    );

    const sentCountryReducer$ = obsToStream(countryRequest$).mapTo(
        OptReducer((prevState: State) =>
            produce(prevState, draft => {
                draft.requests.country = {
                    timestamp: Date.now(),
                };
            })
        )
    );

    const sentWorldReducer$ = obsToStream(worldRequest$).mapTo(
        OptReducer((prevState: State) =>
            produce(prevState, draft => {
                draft.requests.world = {
                    timestamp: Date.now(),
                };
            })
        )
    );

    const sentUserReducer$ = obsToStream(userRequest$).mapTo(
        OptReducer((prevState: State) =>
            produce(prevState, draft => {
                draft.requests.user = {
                    timestamp: Date.now(),
                };
            })
        )
    );

    const props = {
        settings$,
    };

    const { state: _, ...childSources } = { ...sources, props };

    const eventSinks = event(childSources);
    const mailSinks = mail(childSources);
    const trainingSinks = training(childSources);
    const warSinks = war(childSources);
    const unitSinks = unit(childSources);

    const update$ = sources.api
        .response("notifications")
        .filter(isSuccess)
        .map(
            ({ data }): DBAction => db =>
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
                            if (!old.user) return old;

                            old.user.notification = {
                                war: data.timers.war,
                                events: data.unreadEvents,
                                mail: data.unreadMails,
                                reimburse: data.timers.reimbursement,
                            };

                            old.user.training = {
                                timer: data.timers.statistics,
                                queue: data.training.queued.length,
                                queueSize: data.training.queueSize,
                                lastTrained: data.training.currentlyTraining as
                                    | 1
                                    | 2
                                    | 3
                                    | 4,
                            };
                            return old;
                        })
                    )
        );

    const ownSinks = {
        api: obsToStream(request$),
        state: xs.merge<Reducer<any>>(
            initialReducer$,
            sentNotificationReducer$,
            sentCountryReducer$,
            sentWorldReducer$,
            sentUserReducer$
        ),
        DB: update$,
        runtime: xs.empty(),
    };

    return mergeSinks([
        ownSinks,
        eventSinks,
        trainingSinks,
        mailSinks,
        warSinks,
        unitSinks,
    ]);
};

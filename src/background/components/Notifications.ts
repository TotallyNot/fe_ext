import { Stream, default as xs } from "xstream";

import { timer, EMPTY, combineLatest, merge } from "rxjs";
import {
    switchMap,
    map,
    mapTo,
    filter,
    pluck,
    tap,
    shareReplay,
    distinctUntilChanged,
} from "rxjs/operators";

import isolate from "@cycle/isolate";
import { Reducer, StateSource } from "@cycle/state";

import { mergeSinks } from "cyclejs-utils";

import produce from "immer";

import { obsToStream, streamToObs } from "common/connect";

import { NotificationInfo } from "common/models/runtime/notificationInfo";
import { NotificationSettings } from "common/models/runtime/notificationSettings";
import { Component, isSome, isSuccess } from "common/types";
import { OptReducer, InitReducer } from "common/state";

import { APISource, APIRequest } from "common/drivers/apiDriver";
import { DBSource, DBAction } from "common/drivers/dbDriver";
import { RuntimeSource, RuntimeMessage } from "../drivers/runtimeDriver";
import {
    NotificationSource,
    NotificationActions,
} from "../drivers/notificationDriver";

import { State as EventState, Event } from "./Event";
import { State as MailState, Mail } from "./Mail";
import { State as StatisticState, Statistic } from "./Statistic";
import { State as WarState, War } from "./War";
import { State as TroopsState, Troops } from "./Troops";

export interface State {
    settings: {
        refreshPeriod: number;
    };

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

    events: EventState;
    statistic: StatisticState;
    mail: MailState;
    war: WarState;
    troops: TroopsState;
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

    const refreshPeriod$ = state$.pipe(
        pluck("settings", "refreshPeriod"),
        distinctUntilChanged()
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

    const notificationSettings$ = sources.runtime.select(
        "NotificationSettings",
        NotificationSettings
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
            settings: {
                refreshPeriod: 30,
            },
            events: {
                active: true,
                shown: false,
                dismissed: false,
            },
            mail: {
                active: true,
                shown: false,
                dismissed: false,
            },
            war: {
                active: true,
                shown: false,
                dismissed: false,
            },
            statistic: {
                active: true,
                shown: false,
                dismissed: false,
            },
            troops: {
                active: true,
                axis: true,
                allies: true,
                cooldown: 60,
            },
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

    const settingsReducer$ = notificationSettings$.map(settings =>
        OptReducer((state: State) =>
            produce(state, draft => {
                draft.events.active = settings.events;
                draft.mail.active = settings.mail;
                draft.war.active = settings.war;
                draft.troops.active = settings.troops;
                draft.troops.allies = settings.troopsAllies;
                draft.troops.axis = settings.troopsAxis;
                draft.troops.cooldown = settings.troopsCooldown;
            })
        )
    );

    const eventSinks = isolate(Event, { state: "events" })(sources);

    const mailSinks = isolate(Mail, { state: "mail" })(sources);

    const statisticSinks = isolate(Statistic, { state: "statistic" })(sources);

    const warSinks = isolate(War, { state: "war" })(sources);

    const troopsSinks = isolate(Troops, { state: "troops" })(sources);

    const notificationInfo$ = state$.pipe(
        map((state): NotificationInfo | undefined => {
            if (
                !state.statistic.api ||
                !state.war.timestamp ||
                !state.troops.country ||
                !state.troops.units ||
                state.events.unread === undefined ||
                state.mail.unread === undefined
            ) {
                return undefined;
            } else {
                return {
                    country: state.troops.country,
                    timers: {
                        war: state.war.timestamp,
                        statistics: state.statistic.api.timestamp,
                    },

                    queue: {
                        current: state.statistic.api.queued,
                        size: state.statistic.api.queueSize,
                    },

                    units: state.troops.units,
                    events: state.events.unread,
                    mail: state.events.unread,
                };
            }
        }),
        filter(isSome),
        map(info => ({ kind: "NotificationInfo", data: info }))
    );

    const settings$ = state$.pipe(
        map(
            (state): NotificationSettings => ({
                refreshPeriod: state.settings.refreshPeriod,
                events: state.events.active,
                mail: state.mail.active,
                statistic: state.statistic.active,
                war: state.war.active,
                troops: state.troops.active,
                troopsAllies: state.troops.allies,
                troopsAxis: state.troops.axis,
                troopsCooldown: state.troops.cooldown,
            })
        ),
        map(settings => ({ kind: "NotificationSettings", data: settings }))
    );

    const update$ = sources.api
        .response("notifications")
        .filter(isSuccess)
        .map(
            ({ data }): DBAction => db =>
                db.player
                    .find({
                        selector: {
                            user: {
                                $exists: true,
                            },
                        },
                    })
                    .update({
                        $set: {
                            "user.notification": {
                                war: data.timers.war,
                                events: data.unreadEvents,
                                mail: data.unreadMails,
                                reimburse: data.timers.reimbursement,
                            },
                            "user.training": {
                                timer: data.timers.statistics,
                                queue: data.training.queued.length,
                                queueSize: data.training.queueSize,
                            },
                        },
                    })
        );

    const ownSinks = {
        api: obsToStream(request$),
        state: xs.merge(
            initialReducer$,
            sentNotificationReducer$,
            sentCountryReducer$,
            sentWorldReducer$,
            sentUserReducer$,
            settingsReducer$
        ),
        runtime: obsToStream(merge(notificationInfo$, settings$)),
        DB: update$,
    };

    return mergeSinks([
        ownSinks,
        eventSinks,
        statisticSinks,
        mailSinks,
        warSinks,
        troopsSinks,
    ]);
};

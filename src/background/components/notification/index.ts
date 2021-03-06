import { Stream, default as xs } from "xstream";

import { timer, EMPTY, of, from, merge, concat, Observable } from "rxjs";
import {
    switchMap,
    map,
    filter,
    switchMapTo,
    shareReplay,
    distinctUntilChanged,
} from "rxjs/operators";

import { Reducer, StateSource } from "@cycle/state";

import { mergeSinks } from "cyclejs-utils";

import { obsToStream, streamToObs } from "common/connect";

import { Component, isSome, isSuccess } from "common/types";
import { OptReducer } from "common/state";
import { deepCompare } from "common/util";

import { APISource, APIRequest } from "common/drivers/apiDriver";
import { DBSource, DBAction } from "common/drivers/dbDriver";
import { RuntimeSource, RuntimeMessage } from "../../drivers/runtimeDriver";
import {
    NotificationSource,
    NotificationActions,
} from "../../drivers/notificationDriver";

import event from "./components/event";
import mail from "./components/mail";
import training from "./components/training";
import units from "./components/units";
import war from "./components/war";
import reimbursement from "./components/reimbursement";

import { PlayerDocType } from "common/models/db/player/types";

export type ChildProps = {
    settings$: Observable<Required<PlayerDocType>["settings"]["notification"]>;
};

export interface State {
    lastRequest?: number;
    apiKey?: string;
    refreshPeriod: number;

    world: boolean;
    team: "Allies" | "Axis" | "None";
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
    const state$ = streamToObs(sources.state.stream).pipe(filter(isSome));

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
        )
    );

    const settingsReducer$ = user$.pipe(
        map(
            (user): Reducer<State> => state => {
                if (!user || !user.user || !user.settings) {
                    return (
                        state && {
                            refreshPeriod: state.refreshPeriod,
                            world: state.world,
                            team: state.team,
                        }
                    );
                } else {
                    return {
                        ...(state ?? {}),
                        refreshPeriod: user.settings.notification.refreshPeriod,
                        apiKey: user.user.apiKey,

                        world: user.settings.notification.world,
                        team: user.team,
                    };
                }
            }
        )
    );

    const requests$ = state$.pipe(
        distinctUntilChanged(deepCompare),
        switchMap(({ apiKey, refreshPeriod, lastRequest, world, team }) =>
            apiKey
                ? timer(delayTime(refreshPeriod, lastRequest)).pipe(
                      switchMapTo(
                          concat<APIRequest>(
                              of({ apiKey, selection: "user" }),
                              team !== "None"
                                  ? from([
                                        { apiKey, selection: "notifications" },
                                        {
                                            apiKey,
                                            selection: world
                                                ? "world"
                                                : "country",
                                        },
                                    ])
                                  : EMPTY
                          )
                      )
                  )
                : EMPTY
        ),
        shareReplay(1)
    );

    const requestReducer$ = requests$.pipe(
        map(() =>
            OptReducer<State>(state => ({ ...state, lastRequest: Date.now() }))
        )
    );

    const reducer$ = merge(settingsReducer$, requestReducer$);

    const props = {
        settings$: user$.pipe(
            map(user => user?.toJSON().settings?.notification),
            filter(isSome),
            distinctUntilChanged(deepCompare)
        ),
    };

    const { state: _, ...childSources } = { ...sources, props };

    const eventSinks = event(childSources);
    const mailSinks = mail(childSources);
    const trainingSinks = training(childSources);
    const warSinks = war(childSources);
    const unitSinks = units(childSources);
    const reimburseSinks = reimbursement(childSources);

    const updateNotifcation$ = sources.api
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

    const updateUser$ = sources.api
        .response("user")
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

                            old.name = data.name;
                            old.team = data.team;

                            return old;
                        })
                    )
        );

    const ownSinks = {
        api: obsToStream(requests$),
        state: obsToStream(reducer$) as Stream<Reducer<unknown>>,
        DB: xs.merge(updateNotifcation$, updateUser$),
        runtime: xs.empty(),
    };

    return mergeSinks(
        [
            ownSinks,
            eventSinks,
            trainingSinks,
            mailSinks,
            warSinks,
            unitSinks,
            reimburseSinks,
        ],
        { state: () => ownSinks.state }
    );
};

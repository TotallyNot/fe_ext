import { timer, merge, of } from "rxjs";
import {
    map,
    mapTo,
    pluck,
    filter,
    first,
    switchMapTo,
    tap,
} from "rxjs/operators";

import produce from "immer";

import { OptReducer, InitReducer } from "common/state";
import { isSome } from "common/types";

import { Inputs } from "./intent";

export interface State {
    user?: {
        events: number;
        mail: number;

        war: number;
        training: number;
        reimburse: number;

        queue: number;
        queueSize: number;
    };

    country?: {
        name: string;
        allies: number;
        axis: number;
    };

    timers?: {
        war: string;
        training: string;
        reimburse: string;
    };
}

const formatDiff = (timestamp: number, now: number) => {
    const diff = Math.max(timestamp - now, 0);
    return [Math.floor(diff / 3600), Math.floor(diff / 60) % 60, diff % 60]
        .map(number => number.toString().padStart(2, "0"))
        .join(":");
};

export const model = ({ user$, country$ }: Inputs) => {
    const initReducer$ = of(InitReducer<State>({}));

    const userReducer$ = user$.pipe(
        pluck("user"),
        filter(isSome),
        map(
            ({ notification, training }) =>
                notification && training && ([notification, training] as const)
        ),
        filter(isSome),
        map(([notification, training]) =>
            OptReducer<State>(state => ({
                ...state,
                user: {
                    events: notification.events,
                    mail: notification.mail,

                    war: notification.war,
                    training: training.timer,
                    reimburse: 0,

                    queue: training.queue,
                    queueSize: training.queueSize,
                },
            }))
        )
    );

    const countryReducer$ = country$.pipe(
        filter(isSome),
        map(({ name, units }) => units && { name, units }),
        filter(isSome),
        map(({ name, units }) =>
            OptReducer<State>(state => ({
                ...state,
                country: {
                    name,
                    allies: units.allies,
                    axis: units.axis,
                },
            }))
        )
    );

    const timerReducer$ = user$.pipe(
        first(),
        switchMapTo(
            timer(0, 1000).pipe(
                mapTo(
                    OptReducer<State>(state =>
                        produce(state, draft => {
                            if (!state.user) return;

                            const now = Math.floor(Date.now() / 1000);
                            draft.timers = {
                                war: formatDiff(state.user.war, now),
                                training: formatDiff(state.user.training, now),
                                reimburse: formatDiff(
                                    state.user.reimburse,
                                    now
                                ),
                            };
                        })
                    )
                )
            )
        )
    );

    return merge(initReducer$, userReducer$, countryReducer$, timerReducer$);
};

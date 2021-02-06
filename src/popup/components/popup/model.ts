import { Stream, default as xs } from "xstream";

import { Reducer } from "@cycle/state";

import produce from "immer";

import { OptReducer } from "common/state";
import { NotificationInfo } from "common/models/runtime/notificationInfo";

import { Inputs } from "./intent";

export interface State {
    notificationInfo: NotificationInfo;

    timers: {
        war?: string;
        statistics?: string;
    };
}

export interface Sinks {
    state: Stream<Reducer<any>>;
}

const formatDiff = (seconds: number) =>
    [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
        .map(number => number.toString().padStart(2, "0"))
        .join(":");

export const model = ({ notificationInfo$ }: Inputs): Sinks => {
    const runtimeReducer$ = notificationInfo$.map(
        (notificationInfo): Reducer<State> => () => ({
            notificationInfo,
            timers: {},
        })
    );

    const timerReducer$ = notificationInfo$
        .map(() => xs.merge(xs.of(-1), xs.periodic(1000)))
        .flatten()
        .mapTo(
            OptReducer((state: State) =>
                produce(state, draft => {
                    const now = Math.floor(Date.now() / 1000);

                    draft.timers.war = formatDiff(
                        Math.max(state.notificationInfo.timers.war - now, 0)
                    );
                    draft.timers.statistics = formatDiff(
                        Math.max(
                            state.notificationInfo.timers.statistics - now,
                            0
                        )
                    );
                })
            )
        );

    return {
        state: xs.merge(runtimeReducer$, timerReducer$),
    };
};

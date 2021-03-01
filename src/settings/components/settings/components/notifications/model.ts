import { merge } from "rxjs";
import {
    map,
    tap,
    filter,
    distinctUntilChanged,
    withLatestFrom,
} from "rxjs/operators";

import { obsToStream } from "common/connect";
import { isSome } from "common/types";
import { deepCompare } from "common/util";
import { DBAction } from "common/drivers/dbDriver";

import { Inputs } from "./intent";

export const model = (inputs: Inputs) => {
    const checkboxAction$ = inputs.checkbox$.pipe(
        withLatestFrom(inputs.user$.pipe(filter(isSome))),
        map(
            ([event, user]): DBAction => () =>
                user.atomicUpdate(old => {
                    const value: boolean = (event.target as any).checked;
                    const name: string = (event.target as any).name;
                    const notification = old.settings?.notification;
                    if (!notification) return old;
                    if (
                        [
                            "war",
                            "world",
                            "training",
                            "reimburse",
                            "event",
                            "mail",
                            "userLocationActive",
                        ].includes(name)
                    ) {
                        (notification as any)[name] = value;
                    } else {
                        if (name === "userLocationAllies") {
                            notification.userLocation.allies = value;
                        } else if (name === "userLocationAxis") {
                            notification.userLocation.axis = value;
                        } else if (name === "userLocationCooldownActive") {
                            notification.userLocation.cooldownActive = value;
                        }
                    }

                    return old;
                })
        )
    );

    const inputAction$ = inputs.numberField$.pipe(
        withLatestFrom(inputs.user$.pipe(filter(isSome))),
        map(
            ([event, user]): DBAction => () =>
                user.atomicUpdate(old => {
                    const value: number = parseInt((event.target as any).value);
                    const name: string = (event.target as any).name;
                    const notification = old.settings?.notification;
                    if (!notification) return old;

                    if (name === "refreshPeriod") {
                        notification.refreshPeriod = Math.max(15, value);
                    } else if (name === "userLocationCooldown") {
                        notification.userLocation.cooldown = value;
                    }

                    return old;
                })
        )
    );

    const DB$ = merge(checkboxAction$, inputAction$);

    return {
        DB: obsToStream(DB$),
        settings$: inputs.settings$.pipe(distinctUntilChanged(deepCompare)),
    };
};

export type Output = ReturnType<typeof model>;

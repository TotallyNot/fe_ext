import { merge } from "rxjs";
import { map, mapTo, filter } from "rxjs/operators";

import { isSome } from "common/types";

import { Inputs } from "./intent";

export const model = (inputs: Inputs) => {
    const loggedOut$ = inputs.user$.pipe(
        filter(user => user === null),
        mapTo({
            loggedIn: false as const,
        })
    );

    const loggedIn$ = inputs.user$.pipe(
        filter(isSome),
        map(user => ({
            loggedIn: true as const,
            name: user.name,
            apiKey: user.user!.apiKey,
        }))
    );

    return merge(loggedOut$, loggedIn$);
};

export type State = ReturnType<typeof model>;

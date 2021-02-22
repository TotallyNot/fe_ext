import { HistoryInput } from "@cycle/history";
import { switchMap, map } from "rxjs/operators";

import xs from "xstream";
import pluck from "common/xs/pluck";

import { obsToStream } from "common/connect";

import { Component } from "common/route";
import { isSome } from "common/types";

import { Sources, Sinks } from "./types";
import { resolve } from "./routes";

const Root: Component<Sources, Sinks> = sources => {
    const root$ = sources.history
        .debug("history")
        .map(location => resolve(location.pathname))
        .filter(isSome)
        .map(({ getComponent }) =>
            xs.fromPromise(getComponent().then(component => component(sources)))
        )
        .flatten();

    const redirect$ = sources.DB.db$.pipe(
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
        map((result): HistoryInput => (result ? "/popup" : "/login"))
    );

    return {
        DOM: root$
            .compose(pluck("DOM"))
            .filter(isSome)
            .flatten(),
        background: root$
            .compose(pluck("background"))
            .filter(isSome)
            .flatten(),
        DB: root$
            .compose(pluck("DB"))
            .filter(isSome)
            .flatten(),
        api: root$
            .compose(pluck("api"))
            .filter(isSome)
            .flatten(),
        history: obsToStream(redirect$),
    };
};

export default Root;

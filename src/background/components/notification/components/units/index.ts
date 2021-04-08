import { Stream } from "xstream";

import { merge, from, asyncScheduler, EMPTY } from "rxjs";
import {
    filter,
    groupBy,
    mergeMap,
    switchMap,
    switchMapTo,
    first,
    pairwise,
    map,
    pluck,
    share,
    distinctUntilChanged,
    skip,
    observeOn,
    throttleTime,
} from "rxjs/operators";

import { Component, isSuccess, isSome } from "common/types";
import { obsToStream, streamToObs } from "common/connect";

import { APISource } from "common/drivers/apiDriver";
import { DBSource, DBAction } from "common/drivers/dbDriver";
import {
    NotificationSource,
    NotificationActions,
    create,
} from "../../../../drivers/notificationDriver";

import { ChildProps } from "../..";

interface Sources {
    api: APISource;
    notifications: NotificationSource;
    DB: DBSource;
    props: ChildProps;
}

interface Sinks {
    notifications: Stream<NotificationActions>;
    DB: Stream<DBAction>;
}

export const units: Component<Sources, Sinks> = sources => {
    const world$ = streamToObs(sources.api.response("world")).pipe(
        filter(isSuccess),
        observeOn(asyncScheduler),
        share()
    );

    const country$ = streamToObs(sources.api.response("country")).pipe(
        filter(isSuccess),
        pluck("data"),
        share()
    );

    const settings$ = sources.props.settings$;

    const currentCountry$ = streamToObs(sources.api.response("user")).pipe(
        filter(isSuccess),
        pluck("data", "country"),
        filter(isSome),
        distinctUntilChanged()
    );

    const initCollection$ = sources.DB.db$.pipe(
        switchMap(db => db.country.findOne().$),
        filter(country => country === null),
        switchMapTo(world$.pipe(first())),
        map(
            ({ data }): DBAction => db =>
                db.country.bulkInsert(
                    data.map(country => ({
                        id: country.id,
                        name: country.name,
                        region: country.region,
                        code: country.code,
                        land: country.land,
                        coastline: country.coastline,

                        coordinates: country.coordinates,
                        current: false,
                        units: country.units,
                        deltas: [],
                    }))
                )
        )
    );

    const updateCurrent$ = currentCountry$.pipe(
        switchMap(countryID =>
            from<DBAction[]>([
                db =>
                    db.country
                        .find({
                            selector: {
                                id: {
                                    $ne: countryID,
                                },
                                current: true,
                            },
                        })
                        .exec()
                        .then(results =>
                            Promise.all(
                                results.map(result =>
                                    result.atomicPatch({
                                        current: false,
                                    })
                                )
                            )
                        ),
                db =>
                    db.country
                        .findOne({
                            selector: {
                                id: countryID,
                            },
                        })
                        .exec()
                        .then(result =>
                            result?.current === true
                                ? undefined
                                : result?.atomicPatch({
                                      current: true,
                                  })
                        ),
            ])
        )
    );

    const diff$ = merge(
        world$.pipe(mergeMap(({ data }) => from(data))),
        country$
    ).pipe(
        groupBy(country => country.id),
        mergeMap(country$ =>
            country$.pipe(
                pairwise(),
                filter(
                    ([prev, curr]) =>
                        prev.units.allies !== curr.units.allies ||
                        prev.units.axis !== curr.units.axis
                )
            )
        ),
        share()
    );

    const addDelta$ = diff$.pipe(
        map(
            ([prev, curr]): DBAction => db =>
                db.country
                    .findOne(curr.id)
                    .exec()
                    .then(country =>
                        country?.atomicUpdate(old => {
                            const cuttoff = Date.now() - 3 * 864000 * 1000;
                            old.deltas = old.deltas.filter(
                                delta => delta.timestamp >= cuttoff
                            );
                            const delta: typeof old.deltas[number] = {
                                timestamp: Date.now(),
                                allies: curr.units.allies - prev.units.allies,
                                axis: curr.units.axis - prev.units.axis,
                            };
                            if (delta.allies === 0) {
                                delete delta.allies;
                            }
                            if (delta.axis === 0) {
                                delete delta.axis;
                            }
                            old.deltas.push(delta);

                            old.units = curr.units;

                            return old;
                        })
                    )
        )
    );

    const event$ = sources.DB.db$.pipe(
        switchMap(db => db.country.findOne({ selector: { current: true } }).$),
        filter(isSome),
        map(doc => doc.toJSON()),
        groupBy(country => country.id),
        switchMap(country$ => country$.pipe(skip(1))),
        share()
    );

    const alliesNotif$ = event$.pipe(
        map(country => [
            country.name,
            country.deltas[country.deltas.length - 1]?.allies,
        ]),
        filter(([_, delta]) => delta !== undefined),
        map(([name, delta]) =>
            create("current_allies", {
                title: `Allied units in ${name}`,
                message: `Changed by ${delta}!`,
                iconUrl: "icon256.png",
                type: "basic",
            })
        )
    );

    const alliesCreate$ = settings$.pipe(
        switchMap(({ userLocation, userLocationActive }) =>
            !userLocationActive || !userLocation.allies
                ? EMPTY
                : alliesNotif$.pipe(
                      throttleTime(
                          userLocation.cooldownActive
                              ? userLocation.cooldown * 1000
                              : 0
                      )
                  )
        )
    );

    const axisNotif$ = event$.pipe(
        map(country => [
            country.name,
            country.deltas[country.deltas.length - 1]?.axis,
        ]),
        filter(([_, delta]) => delta !== undefined),
        map(([name, delta]) =>
            create("current_axis", {
                title: `Axis units in ${name}`,
                message: `Changed by ${delta}!`,
                iconUrl: "icon256.png",
                type: "basic",
            })
        )
    );

    const axisCreate$ = settings$.pipe(
        switchMap(({ userLocation, userLocationActive }) =>
            !userLocationActive || !userLocation.allies
                ? EMPTY
                : axisNotif$.pipe(
                      throttleTime(
                          userLocation.cooldownActive
                              ? userLocation.cooldown * 1000
                              : 0
                      )
                  )
        )
    );

    const db$ = merge(initCollection$, addDelta$, updateCurrent$);

    const notification$ = merge(alliesCreate$, axisCreate$);

    return {
        notifications: obsToStream(notification$),
        DB: obsToStream(db$),
    };
};

export default units;

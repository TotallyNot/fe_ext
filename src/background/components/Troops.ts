import { Stream } from "xstream";

import { merge, from, asyncScheduler, EMPTY } from "rxjs";
import {
    filter,
    groupBy,
    mergeMap,
    switchMap,
    pairwise,
    map,
    pluck,
    share,
    distinctUntilChanged,
    withLatestFrom,
    skip,
    throttleTime,
    observeOn,
} from "rxjs/operators";
import { v4 } from "uuid";

import { Component, isSuccess, isSome } from "common/types";
import { obsToStream, streamToObs } from "common/connect";

import { APISource } from "common/drivers/apiDriver";
import { DBSource, DBAction } from "common/drivers/dbDriver";
import {
    NotificationSource,
    NotificationActions,
    create,
} from "../drivers/notificationDriver";

import { CountryEventDocType } from "common/models/db/countryEvent/types";
import { CountryDocType } from "common/models/db/country/types";

import { ChildProps } from "./Notifications";

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
    const country$ = streamToObs(sources.api.response("world")).pipe(
        filter(isSuccess),
        observeOn(asyncScheduler),
        mergeMap(({ data }) => from(data)),
        share()
    );

    const settings$ = sources.props.settings$;

    const insertEvents$ = country$.pipe(
        groupBy(country => country.id),
        observeOn(asyncScheduler),
        mergeMap(country$ =>
            country$.pipe(
                pairwise(),
                map(([prev, curr]) => {
                    const mapValue = (
                        selector: (value: typeof prev) => number
                    ) =>
                        selector(prev) === selector(curr)
                            ? undefined
                            : selector(curr) - selector(prev);
                    const deltas = {
                        allies: mapValue(country => country.units.allies),
                        axis: mapValue(country => country.units.axis),

                        groundDefences: mapValue(
                            country => country.facilities.groundDefences
                        ),
                        airDefences: mapValue(
                            country => country.facilities.airDefences
                        ),
                        factories: mapValue(
                            country => country.facilities.factories
                        ),
                        mines: mapValue(country => country.facilities.mines),
                        rigs: mapValue(country => country.facilities.rigs),
                    };

                    for (const key in deltas) {
                        if (deltas[key as keyof typeof deltas] === undefined) {
                            delete deltas[key as keyof typeof deltas];
                        }
                    }

                    const country: CountryEventDocType = {
                        id: v4(),
                        countryID: curr.id,
                        timestamp: Date.now(),
                        deltas,
                    };

                    return country;
                })
            )
        ),
        filter(
            event =>
                Object.values(event.deltas).filter(value => value !== undefined)
                    .length !== 0
        ),
        map((deltas): DBAction => db => db.world.insert(deltas))
    );

    const currentCountry$ = streamToObs(sources.api.response("user")).pipe(
        filter(isSuccess),
        pluck("data", "country"),
        filter(isSome),
        distinctUntilChanged()
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
                            result?.atomicPatch({
                                current: true,
                            })
                        ),
            ])
        )
    );

    const updateUnits$ = country$.pipe(
        withLatestFrom(currentCountry$),
        filter(([country, countryID]) => country.id === countryID),
        distinctUntilChanged(
            (prev, curr) =>
                prev[0].units.allies === curr[0].units.allies &&
                prev[0].units.axis === curr[0].units.axis
        ),
        map(
            ([country, _]): DBAction => db =>
                db.country
                    .findOne({
                        selector: {
                            id: country.id,
                        },
                    })
                    .exec()
                    .then(record =>
                        record?.atomicPatch({
                            units: country.units,
                        })
                    )
        )
    );

    const db$ = merge(insertEvents$, updateCurrent$, updateUnits$);

    const countryEvent$ = currentCountry$.pipe(
        switchMap(countryID =>
            sources.DB.db$.pipe(
                switchMap(
                    db =>
                        db.world.findOne({
                            selector: {
                                countryID,
                            },
                            sort: [
                                {
                                    timestamp: "desc",
                                },
                            ],
                        }).$
                ),
                skip(1),
                filter(isSome)
            )
        ),
        share()
    );

    const alliesCreate$ = settings$.pipe(
        switchMap(({ userLocation, userLocationActive }) =>
            !userLocationActive || !userLocation.allies
                ? EMPTY
                : countryEvent$.pipe(
                      filter(({ deltas }) => deltas.allies !== undefined),
                      switchMap(event =>
                          from(event.populate("countryID")).pipe(
                              map((country: CountryDocType) =>
                                  create("current_allies", {
                                      title: `Allied units in ${country.name}`,
                                      message: `Changed by ${event.deltas.allies}!`,
                                      iconUrl: "placeholder.png",
                                      type: "basic",
                                  })
                              )
                          )
                      ),
                      throttleTime(
                          userLocation.cooldownActive
                              ? userLocation.cooldown * 1000
                              : 0
                      )
                  )
        )
    );

    const axisCreate$ = settings$.pipe(
        switchMap(({ userLocation, userLocationActive }) =>
            !userLocationActive || !userLocation.axis
                ? EMPTY
                : countryEvent$.pipe(
                      filter(({ deltas }) => deltas.axis !== undefined),
                      switchMap(event =>
                          from(event.populate("countryID")).pipe(
                              map((country: CountryDocType) =>
                                  create("current_axis", {
                                      title: `Axis units in ${country.name}`,
                                      message: `Changed by ${event.deltas.axis}!`,
                                      iconUrl: "placeholder.png",
                                      type: "basic",
                                  })
                              )
                          )
                      ),
                      throttleTime(
                          userLocation.cooldownActive
                              ? userLocation.cooldown * 1000
                              : 0
                      )
                  )
        )
    );

    const notification$ = merge(alliesCreate$, axisCreate$);

    return {
        notifications: obsToStream(notification$),
        DB: obsToStream(db$),
    };
};

export default units;

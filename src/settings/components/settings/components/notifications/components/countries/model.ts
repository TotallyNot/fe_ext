import { Observable, combineLatest, merge } from "rxjs";
import { map, filter, withLatestFrom } from "rxjs/operators";

import { isSome } from "common/types";

import { DBAction } from "common/drivers/dbDriver";

import { Inputs } from "./intent";

export const model = (
    inputs: Inputs,
    selection$: Observable<{ key: string; name: string }>
) => {
    const countries$ = inputs.user$.pipe(
        map(user => user.settings?.notification.countries),
        filter(isSome)
    );

    const state$ = countries$.pipe(map(countries => ({ countries })));

    const selectProps$ = combineLatest([inputs.countryList$, countries$]).pipe(
        map(([list, countries]) => {
            const ids = new Set(countries.map(country => country.id));
            return list.filter(country => !ids.has(country.id));
        }),
        map(countries => ({
            options: countries
                .map(country => ({
                    key: country.id,
                    name: country.name,
                    caption: country.code.toUpperCase(),
                }))
                .sort((a, b) => parseInt(a.key) - parseInt(b.key)),
        }))
    );

    const addCountry$ = selection$.pipe(
        withLatestFrom(inputs.user$),
        map(
            ([selection, user]): DBAction => () =>
                user
                    .atomicUpdate(old => {
                        if (!old.settings) return old;

                        const countries = old.settings.notification.countries;
                        if (
                            countries.find(
                                country => country.id === selection.key
                            )
                        )
                            return old;

                        countries.push({
                            id: selection.key,
                            name: selection.name,
                            axis: true,
                            allies: true,
                            cooldown: { active: false, seconds: 60 },
                        });
                        old.settings.notification.countries = countries;
                        return old;
                    })
                    .catch(console.log)
        )
    );

    const removeCountry$ = inputs.remove$.pipe(
        withLatestFrom(inputs.user$),
        map(
            ([id, user]): DBAction => () =>
                user.atomicUpdate(old => {
                    if (!old.settings) return old;

                    const countries = old.settings.notification.countries;
                    old.settings.notification.countries = countries.filter(
                        country => country.id !== id
                    );

                    return old;
                })
        )
    );

    const toggleSetting$ = inputs.toggled$.pipe(
        withLatestFrom(inputs.user$),
        map(
            ([action, user]): DBAction => () =>
                user.atomicUpdate(old => {
                    if (!old.settings) return old;

                    const countries = old.settings.notification.countries;
                    const index = countries.findIndex(
                        country => country.id === action.id
                    );
                    if (index === -1) return old;

                    switch (action.type) {
                        case "allies":
                            countries[index].allies = action.value;
                            break;
                        case "axis":
                            countries[index].axis = action.value;
                            break;
                        case "cooldownActive":
                            countries[index].cooldown.active = action.value;
                            break;
                    }

                    return old;
                })
        )
    );

    const updateCooldown$ = inputs.cooldown$.pipe(
        withLatestFrom(inputs.user$),
        map(
            ([action, user]): DBAction => () =>
                user.atomicUpdate(old => {
                    if (!old.settings) return old;

                    const countries = old.settings.notification.countries;
                    const index = countries.findIndex(
                        country => country.id === action.id
                    );
                    if (index === -1) return old;

                    countries[index].cooldown.seconds = parseInt(action.value);

                    return old;
                })
        )
    );

    const DB = merge(
        addCountry$,
        removeCountry$,
        toggleSetting$,
        updateCooldown$
    );

    return {
        state$,
        selectProps$,
        DB,
    };
};

export type Outputs = ReturnType<typeof model>;
export type StateStream = Outputs["state$"];

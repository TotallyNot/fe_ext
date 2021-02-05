import { Union, Object, Literal, Runtype, Static } from "funtypes";

import { FEError } from "./error";
export { FEError } from "./error";

import { FENotifications } from "./notifications";
import { User } from "./user";
import { Country } from "./country";

export * from "./runtime";

const makeResponse = <T extends Runtype<unknown>>(type: T) =>
    Union(
        FEError,
        Object({ error: Literal(false), reason: Literal(false), data: type })
    );

export const API = Object({
    notifications: makeResponse(FENotifications),
    user: makeResponse(User),
    country: makeResponse(Country),
});

export type API = Static<typeof API>;

export type Payload<K extends keyof API> = Static<
    typeof API.fields[K]["alternatives"][1]
>["data"];

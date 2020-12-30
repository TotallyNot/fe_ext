import { Union, Record, Literal, Runtype, Static } from "runtypes";

import { FEError } from "./error";
export { FEError } from "./error";

import { FENotifications } from "./notifications";

const makeResponse = <T extends Runtype>(type: T) =>
    Union(
        FEError,
        Record({ error: Literal(false), reason: Literal(false), data: type })
    );

export const API = Record({
    notifications: makeResponse(FENotifications),
});

export type API = Static<typeof API>;

export type Payload<K extends keyof API> = Static<
    typeof API.fields[K]["alternatives"][1]
>["data"];

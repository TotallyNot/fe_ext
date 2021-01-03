import { Object, String, Boolean, Undefined, Static } from "funtypes";

export const APIKey = Object({
    key: String,
});

export const APIKeyResponse = Object({
    success: Boolean,
    reason: String.Or(Undefined),
});

export type APIKey = Static<typeof APIKey>;

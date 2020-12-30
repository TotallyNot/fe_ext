import { Record, Literal, String, Number, Union, Static } from "runtypes";

export const FEError = Record({
    error: Literal(true),
    reason: Union(Literal(false), String),
    data: Record({
        code: Number,
    }),
});

export type FEError = Static<typeof FEError>;

import { Object, Literal, String, Number, Union, Static } from "funtypes";

export const FEError = Object({
    error: Literal(true),
    reason: Union(Literal(false), String),
    data: Object({
        code: Number,
    }),
});

export type FEError = Static<typeof FEError>;

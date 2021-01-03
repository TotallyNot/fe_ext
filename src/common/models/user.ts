import {
    Object,
    Literal,
    Number,
    String,
    Union,
    Static,
} from "funtypes";

const Personal = Object({
    statistics: Object({
        strength: Number,
        intelligence: Number,
        leadership: Number,
        communication: Number,
    }),

    funds: Number,
    income: Number,
    points: Number,

    country: String,
    discordID: String,
    formation: String,
});

export const User = Object({
    id: String,
    name: String,
    team: Union(Literal("Axis"), Literal("Allies"), Literal("None")),
    joined: Number,
    rank: Number,
    rating: Number,
    lastAction: Number,
    motto: String,
}).And(Personal.asPartial());

export type User = Static<typeof User>;

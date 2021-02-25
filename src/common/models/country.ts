import {
    Object,
    Number,
    String,
    Boolean,
    Literal,
    Union,
    Static,
} from "funtypes";

export const Country = Object({
    id: String,
    name: String,
    region: Union(
        Literal("Africa"),
        Literal("North America"),
        Literal("Australasia"),
        Literal("Europe"),
        Literal("Asia"),
        Literal("South America"),
        Literal("Caribbean"),
        Literal("Middle East"),
        Literal("Antarctica")
    ),
    control: Number,
    controlTeam: Number,
    initialControl: Number,
    coastline: Number,
    land: Number,
    code: String,
    isActiveSpawn: Boolean,
    isSpawn: Boolean,
    coordinates: Object({
        longitude: Number,
        latitude: Number,
    }),
    facilities: Object({
        rigs: Number,
        mines: Number,
        factories: Number,
        groundDefences: Number,
        airDefences: Number,
    }),
    units: Object({
        axis: Number,
        allies: Number,
    }),
});

export type Country = Static<typeof Country>;

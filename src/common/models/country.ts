import { Object, Number, String, Boolean, Static } from "funtypes";

export const Country = Object({
    id: String,
    name: String,
    region: String,
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

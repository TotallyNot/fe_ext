import { Object, String, Number, Static } from "funtypes";

export const NotificationInfo = Object({
    country: String,

    timers: Object({
        war: Number,
        statistics: Number,
    }),

    units: Object({
        allies: Number,
        axis: Number,
    }),

    events: Number,
    mail: Number,
});

export type NotificationInfo = Static<typeof NotificationInfo>;

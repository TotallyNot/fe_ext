import { Object, Boolean, Number, Static } from "funtypes";

export const NotificationSettings = Object({
    refreshPeriod: Number,

    events: Boolean,
    statistic: Boolean,
    mail: Boolean,
    war: Boolean,
    troops: Object({
        active: Boolean,
        axis: Boolean,
        allies: Boolean,
        cooldown: Number,
    }),
});

export type NotificationSettings = Static<typeof NotificationSettings>;

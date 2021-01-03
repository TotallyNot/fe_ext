import { Object, Boolean, Number, Static } from "funtypes";

export const NotificationSettings = Object({
    refreshPeriod: Number,

    events: Boolean,
    statistic: Boolean,
    mail: Boolean,
    war: Boolean,
});

export type NotificationSettings = Static<typeof NotificationSettings>;

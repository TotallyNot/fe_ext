import { Object, Boolean, Number, Static } from "funtypes";

export const NotificationSettings = Object({
    refreshPeriod: Number,

    events: Boolean,
    statistic: Boolean,
    mail: Boolean,
    war: Boolean,
    troops: Boolean,
    troopsAxis: Boolean,
    troopsAllies: Boolean,

    troopsCooldown: Number,
});

export type NotificationSettings = Static<typeof NotificationSettings>;

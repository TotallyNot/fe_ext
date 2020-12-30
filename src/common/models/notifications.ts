import { Record, String, Number, Boolean, Array, Static } from "runtypes";

export const FENotifications = Record({
    timers: Record({
        statistics: Number,
        operations: Number,
        politics: Number,
        war: Number,
    }),
    training: Record({
        currentlyTraining: Number,
        endTime: Number,
        hasUpdated: Boolean,
        modifiedStats: Record({
            communication: Number,
            intelligence: Number,
            leadership: Number,
            strength: Number,
        }),
        queueSize: Number,
        queued: Array(
            Record({
                ID: String,
                stat: String,
            })
        ),
        serverTime: Number,
        stats: Record({
            communication: Number,
            intelligence: Number,
            leadership: Number,
            strength: Number,
        }),
    }),
    unreadMails: Number,
    unreadEvents: Number,
});

export type FENotifcations = Static<typeof FENotifications>;

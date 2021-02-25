import { Object, String, Number, Boolean, Array, Static } from "funtypes";

export const FENotifications = Object({
    timers: Object({
        statistics: Number,
        operations: Number,
        politics: Number,
        war: Number,
        reimbursement: Number,
    }),
    training: Object({
        currentlyTraining: Number,
        endTime: Number,
        hasUpdated: Boolean,
        modifiedStats: Object({
            communication: Number,
            intelligence: Number,
            leadership: Number,
            strength: Number,
        }),
        queueSize: Number,
        queued: Array(
            Object({
                ID: String,
                stat: String,
            })
        ),
        serverTime: Number,
        stats: Object({
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

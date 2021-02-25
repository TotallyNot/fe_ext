import { RxJsonSchema } from "rxdb";

import { PlayerDocType } from "./types";

export const PlayerSchema: RxJsonSchema<PlayerDocType> = {
    title: "Player Schema",
    description: "describes players",
    version: 0,
    type: "object",

    properties: {
        id: {
            type: "string",
            primary: true,
        },
        name: {
            type: "string",
        },
        team: {
            enum: ["Allies", "Axis", "None"],
        },

        user: {
            type: "object",
            properties: {
                apiKey: {
                    type: "string",
                },

                notification: {
                    type: "object",
                    properties: {
                        war: {
                            type: "number",
                        },
                        events: {
                            type: "number",
                        },
                        mail: {
                            type: "number",
                        },
                        reimburse: {
                            type: "number",
                        },
                    },
                    required: ["war", "events", "mail"],
                },

                training: {
                    type: "object",
                    properties: {
                        timer: {
                            type: "number",
                        },
                        queue: {
                            type: "number",
                        },
                        queueSize: {
                            type: "number",
                        },
                        lastTrained: {
                            type: "number",
                        },
                    },
                    required: ["timer", "queue", "queueSize"],
                },
            },
            required: ["apiKey"],
        },

        settings: {
            type: "object",
            properties: {
                notification: {
                    type: "object",
                    properties: {
                        refreshRate: {
                            type: "number",
                        },

                        event: {
                            type: "boolean",
                        },
                        mail: {
                            type: "boolean",
                        },
                        war: {
                            type: "boolean",
                        },
                        training: {
                            type: "boolean",
                        },
                        reimburse: {
                            type: "boolean",
                        },

                        userLocationActive: {
                            type: "boolean",
                        },
                        userLocations: {
                            type: "object",
                            properties: {
                                allies: {
                                    type: "boolean",
                                },
                                axis: {
                                    type: "boolean",
                                },
                                cooldown: {
                                    type: "integer",
                                },
                                cooldownActive: {
                                    type: "boolean",
                                },
                            },
                            required: [
                                "allies",
                                "axis",
                                "cooldown",
                                "cooldowActive",
                            ],
                        },
                    },
                    required: [
                        "event",
                        "mail",
                        "war",
                        "training",
                        "userLocationActive",
                        "userLocation",
                    ],
                },
            },
            required: ["notification"],
        },
    },

    required: ["id", "name", "team"],
};

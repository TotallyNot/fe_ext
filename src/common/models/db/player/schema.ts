import { RxJsonSchema } from "rxdb";

import { PlayerDocType } from "./types";

export const PlayerSchema: RxJsonSchema<PlayerDocType> = {
    title: "Player Schema",
    description: "describes players",
    version: 2,
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
                    required: ["war", "events", "mail", "reimburse"],
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
                        refreshPeriod: {
                            type: "number",
                        },
                        world: {
                            type: "boolean",
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

                        countries: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: {
                                        type: "string",
                                    },
                                    name: {
                                        type: "string",
                                    },
                                    allies: {
                                        type: "boolean",
                                    },
                                    axis: {
                                        type: "boolean",
                                    },

                                    cooldown: {
                                        type: "object",

                                        properties: {
                                            active: {
                                                type: "boolean",
                                            },
                                            seconds: {
                                                type: "number",
                                            },
                                        },
                                        required: ["active", "seconds"],
                                    },
                                },
                                required: [
                                    "id",
                                    "name",
                                    "allies",
                                    "axis",
                                    "cooldown",
                                ],
                            },
                        },
                    },
                    required: [
                        "refreshPeriod",
                        "world",
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

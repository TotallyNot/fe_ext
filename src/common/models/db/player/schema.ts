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
            },
            required: ["apiKey"],
        },

        settings: {
            type: "object",
            properties: {
                notification: {
                    type: "object",
                    properties: {
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
                    },
                    required: ["event", "mail", "war", "training"],
                },
            },
            required: ["notification"],
        },
    },

    required: ["id", "name", "team"],
};

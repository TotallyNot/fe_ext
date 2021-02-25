import { RxJsonSchema } from "rxdb";

import { CountryEventDocType } from "./types";

export const CountryEventSchema: RxJsonSchema<CountryEventDocType> = {
    title: "Country event schema",
    description: "Contains changes in units and facilities",
    version: 0,
    type: "object",

    properties: {
        id: {
            type: "string",
            primary: true,
        },
        timestamp: {
            type: "integer",
        },
        countryID: {
            type: "string",
            ref: "country",
        },

        deltas: {
            type: "object",
            properties: {
                allies: {
                    type: "integer",
                },
                axis: {
                    type: "integer",
                },

                groundDefences: {
                    type: "integer",
                },
                airDefences: {
                    type: "integer",
                },
                factories: {
                    type: "integer",
                },
                mines: {
                    type: "integer",
                },
                rigs: {
                    type: "integer",
                },
            },
        },
    },

    required: ["timestamp", "countryID", "deltas"],
    indexes: ["countryID", "timestamp"],
};

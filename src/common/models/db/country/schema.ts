import { RxJsonSchema } from "rxdb";

import { CountryDocType } from "./types";

export const CountrySchema: RxJsonSchema<CountryDocType> = {
    title: "Country schema",
    description: "Stores meta information for each country",
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
        region: {
            type: "string",
        },
        code: {
            type: "string",
        },

        land: {
            type: "integer",
        },
        coastline: {
            type: "integer",
        },
        coordinates: {
            type: "object",

            properties: {
                latitude: {
                    type: "number",
                },
                longitude: {
                    type: "number",
                },
            },
            required: ["latitude", "longitude"],
        },

        current: {
            type: "boolean",
        },
        units: {
            type: "object",
            properties: {
                allies: {
                    type: "integer",
                },
                axis: {
                    type: "integer",
                },
            },
            required: ["allies", "axis"],
        },
    },

    required: [
        "name",
        "region",
        "code",
        "land",
        "coastline",
        "coordinates",
        "current",
    ],
};

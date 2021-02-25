import { RxDocument, RxCollection } from "rxdb";

export type CountryEventDocType = {
    id: string;
    countryID: string;
    timestamp: number;

    deltas: {
        allies?: number;
        axis?: number;

        groundDefences?: number;
        airDefences?: number;
        factories?: number;
        mines?: number;
        rigs?: number;
    };
};

export type CountryEventDocument = RxDocument<CountryEventDocType>;

export type CountryEventCollection = RxCollection<CountryEventDocType>;

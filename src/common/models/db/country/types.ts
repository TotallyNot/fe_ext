import { RxDocument, RxCollection } from "rxdb";

export type CountryDocType = {
    id: string;

    name: string;
    region:
        | "Africa"
        | "North America"
        | "Australasia"
        | "Europe"
        | "Asia"
        | "South America"
        | "Caribbean"
        | "Middle East"
        | "Antarctica";
    code: string;

    land: number;
    coastline: number;

    coordinates: {
        latitude: number;
        longitude: number;
    };

    current: boolean;

    units?: {
        allies: number;
        axis: number;
    };
};

export type CountryDocument = RxDocument<CountryDocType>;

export type CountryCollection = RxCollection<CountryDocType>;

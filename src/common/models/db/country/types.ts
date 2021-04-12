import { RxDocument, RxCollection } from "rxdb";

import { Coordinate } from "common/algo/geometry";
import { KDTree } from "common/algo/kdtree";

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

    deltas: {
        timestamp: number;
        allies?: number;
        axis?: number;
    }[];
};

export type CountryDocument = RxDocument<CountryDocType>;

export type CountryNode = {
    id: string;
    name: string;
    cartesian: Coordinate;
};

type CollectionMethods = {
    kdtree: () => Promise<KDTree<CountryNode>>;
};
export type CountryCollection = RxCollection<
    CountryDocType,
    {},
    CollectionMethods
>;

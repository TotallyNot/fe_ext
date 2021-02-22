import { RxDocument, RxCollection } from "rxdb";

export type PlayerDocType = {
    id: string;
    name: string;

    team: "Allies" | "Axis" | "None";

    user?: {
        apiKey: string;
    };

    settings?: {
        notififaction: {
            event: boolean;
            mail: boolean;

            war: boolean;
            training: boolean;
        };
    };
};

export type PlayerDocument = RxDocument<PlayerDocType>;

export type PlayerCollection = RxCollection<PlayerDocType>;

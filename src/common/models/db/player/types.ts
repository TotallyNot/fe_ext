import { RxDocument, RxCollection } from "rxdb";

type UnitNotificationSetting = {
    allies: boolean;
    axis: boolean;

    cooldown: number;
    cooldownActive: boolean;
};

export type PlayerDocType = {
    id: string;
    name: string;

    team: "Allies" | "Axis" | "None";

    user?: {
        apiKey: string;

        notification?: {
            war: number;
            reimburse: number;
            events: number;
            mail: number;
        };

        training?: {
            timer: number;
            queue: number;
            queueSize: number;
            lastTrained: 1 | 2 | 3 | 4;
        };
    };

    settings?: {
        notification: {
            refreshPeriod: number;
            world: boolean;

            event: boolean;
            mail: boolean;

            war: boolean;
            training: boolean;
            reimburse: boolean;

            userLocationActive: boolean;
            userLocation: UnitNotificationSetting;

            countries: {
                id: string;
                name: string;

                allies: boolean;
                axis: boolean;

                cooldown: {
                    active: boolean;
                    seconds: number;
                };
            }[];
        };
    };
};

export type PlayerDocument = RxDocument<PlayerDocType>;

export type PlayerCollection = RxCollection<PlayerDocType>;

import { RxDatabase } from "rxdb";
import { addRxPlugin, createRxDatabase } from "rxdb/plugins/core";

import { RxDBValidateZSchemaPlugin } from "rxdb/plugins/validate-z-schema";
import { RxDBMigrationPlugin } from "rxdb/plugins/migration";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";

import { PlayerCollection } from "./player/types";
import { PlayerSchema } from "./player/schema";
import { CountryCollection } from "./country/types";
import { CountrySchema } from "./country/schema";
import { CountryEventCollection } from "./countryEvent/types";
import { CountryEventSchema } from "./countryEvent/schema";

if (__DEBUG__) {
    addRxPlugin(RxDBDevModePlugin);
}

addRxPlugin(require("pouchdb-adapter-idb"));
addRxPlugin(RxDBValidateZSchemaPlugin);
addRxPlugin(RxDBMigrationPlugin);
addRxPlugin(RxDBUpdatePlugin);

type Collections = {
    player: PlayerCollection;
    country: CountryCollection;
    world: CountryEventCollection;
};

export type Database = RxDatabase<Collections>;

export const makeDB = async () => {
    const db = await createRxDatabase<Collections>({
        name: "fe_ext_db",
        adapter: "idb",
        pouchSettings: {
            auto_compaction: true,
        },
    });

    await db.addCollections({
        player: {
            schema: PlayerSchema,
        },
        country: {
            schema: CountrySchema,
        },
        world: {
            schema: CountryEventSchema,
        },
    });

    return db;
};
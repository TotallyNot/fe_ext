import { RxDatabase } from "rxdb";
import { addRxPlugin, createRxDatabase } from "rxdb/plugins/core";

import { RxDBValidateZSchemaPlugin } from "rxdb/plugins/validate-z-schema";
import { RxDBMigrationPlugin } from "rxdb/plugins/migration";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";

import { PlayerCollection } from "./player/types";
import { PlayerSchema } from "./player/schema";

if (__DEBUG__) {
    addRxPlugin(RxDBDevModePlugin);
}

addRxPlugin(require("pouchdb-adapter-idb"));
addRxPlugin(RxDBValidateZSchemaPlugin);
addRxPlugin(RxDBMigrationPlugin);

type Collections = {
    player: PlayerCollection;
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
    });

    return db;
};

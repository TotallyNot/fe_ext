import { run } from "@cycle/run";

import Root from "./components/Root";
import { APIDriver } from "common/drivers/apiDriver";
import { makeDBDriver } from "common/drivers/dbDriver";
import { NotificationDriver } from "./drivers/notificationDriver";
import { RuntimeDriver } from "./drivers/runtimeDriver";

run(Root, {
    api: APIDriver(),
    notifications: NotificationDriver(),
    runtime: RuntimeDriver(),
    DB: makeDBDriver(),
});

import { run } from "@cycle/run";

import Root from "./components/Root";
import { APIDriver } from "./drivers/apiDriver";
import { NotificationDriver } from "./drivers/notificationDriver";
import { RuntimeDriver } from "./drivers/runtimeDriver";

run(Root, {
    api: APIDriver(),
    notifications: NotificationDriver(),
    runtime: RuntimeDriver(),
});

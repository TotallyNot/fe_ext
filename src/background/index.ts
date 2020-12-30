import { run } from "@cycle/run";

import Root from "./components/Root";
import { APIDriver } from "./drivers/apiDriver";
import { NotificationDriver } from "./drivers/notificationDriver";

run(Root, {
    api: APIDriver(),
    notifications: NotificationDriver(),
});

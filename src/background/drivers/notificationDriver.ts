import { browser, Notifications } from "webextension-polyfill-ts";
import { Stream } from "xstream";

type CreateNotification = {
    kind: "create";
    category: string;
    config: Notifications.CreateNotificationOptions;
};

type ClearNotification = {
    kind: "clear";
    category: string;
};

export type NotificationActions = CreateNotification | ClearNotification;

export const create = (
    category: string,
    config: Notifications.CreateNotificationOptions
): NotificationActions => ({
    kind: "create",
    category,
    config,
});

export const clear = (category: string): NotificationActions => ({
    kind: "clear",
    category,
});

export class NotificationSource {
    constructor(action$: Stream<NotificationActions>) {
        action$.addListener({
            next: action => {
                switch (action.kind) {
                    case "create":
                        browser.notifications.create(
                            action.category,
                            action.config
                        );
                        break;
                    case "clear":
                        browser.notifications.clear(action.category);
                        break;
                }
            },
        });
    }
}

export const NotificationDriver = () => (
    action$: Stream<NotificationActions>
) => new NotificationSource(action$);

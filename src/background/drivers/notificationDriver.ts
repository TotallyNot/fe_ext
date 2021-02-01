import { browser, Notifications } from "webextension-polyfill-ts";
import { Stream, Subscription, default as xs } from "xstream";

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

export type NotificationEvent = {
    id: string;
    kind: "create" | "clear" | "dismissed";
};

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
    private stream: Stream<NotificationEvent>;

    select(id?: string): Stream<NotificationEvent> {
        if (id) {
            return this.stream.filter(event => event.id === id);
        } else {
            return this.stream;
        }
    }

    constructor(action$: Stream<NotificationActions>) {
        let subscription: Subscription | undefined = undefined;
        let callback: any;
        this.stream = xs.create({
            start: listener => {
                subscription = action$.subscribe({
                    next: action => {
                        switch (action.kind) {
                            case "create":
                                browser.notifications
                                    .create(action.category, action.config)
                                    .then(id =>
                                        listener.next({ kind: "create", id })
                                    );
                                break;
                            case "clear":
                                browser.notifications
                                    .clear(action.category)
                                    .then(() =>
                                        listener.next({
                                            kind: "clear",
                                            id: action.category,
                                        })
                                    );
                                break;
                        }
                    },
                });
                callback = (id: string) =>
                    listener.next({ kind: "dismissed", id });
                browser.notifications.onClosed.addListener(callback);
            },
            stop: () => {
                subscription?.unsubscribe();
                browser.notifications.onClosed.removeListener(callback);
            },
        });
    }
}

export const NotificationDriver = () => (
    action$: Stream<NotificationActions>
) => new NotificationSource(action$);

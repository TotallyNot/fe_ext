import { Stream, Subscription, default as xs } from "xstream";
import { browser, Runtime } from "webextension-polyfill-ts";

import {
    RuntimeMessages,
    Resources,
    RuntimeSubscription,
    ResourceUpdate,
    ResourceList,
} from "common/models/runtime";
import { isSome } from "common/types";

export class RuntimeSource {
    private resources: { [K in Resources]?: Stream<ResourceUpdate[K]> };
    private subscriptions: Map<Runtime.Port, Subscription[]>;

    private update$: Stream<any>;

    constructor(update$: Stream<ResourceUpdate>) {
        this.resources = Object.fromEntries(
            ResourceList.map(resource => [
                resource,
                update$
                    .map(update => update[resource])
                    .filter(isSome)
                    .debug(resource)
                    .remember(),
            ])
        );

        // add empty listener in order to start stream
        Object.values(this.resources).forEach(stream =>
            stream?.addListener({})
        );

        this.subscriptions = new Map();
        this.update$ = xs.create({
            start: listener =>
                browser.runtime.onConnect.addListener(port => {
                    port.onDisconnect.addListener(() =>
                        this.subscriptions
                            .get(port)
                            ?.forEach(subscription =>
                                subscription.unsubscribe()
                            )
                    );

                    port.onMessage.addListener(message => {
                        if (RuntimeSubscription.test(message)) {
                            message.subscribe.forEach(resource => {
                                const subscription = this.resources[
                                    resource
                                ]?.subscribe({
                                    next: (next: any) =>
                                        port.postMessage({
                                            resource,
                                            data: next,
                                        }),
                                });
                                if (subscription) {
                                    this.subscriptions.set(
                                        port,
                                        (
                                            this.subscriptions.get(port) ?? []
                                        ).concat([subscription])
                                    );
                                }
                            });
                        }

                        listener.next(message);
                    });
                }),
            stop: () => {},
        });
        // see above
        this.update$.addListener({});
    }

    update<K extends Resources>(
        resource: K
    ): Stream<RuntimeMessages[K]["data"]> {
        return this.update$
            .filter(RuntimeMessages.fields[resource].test)
            .map(({ data }) => data);
    }
}

export const RuntimeDriver = () => (update$: Stream<ResourceUpdate>) =>
    new RuntimeSource(update$);

import { Stream, Subscription, default as xs } from "xstream";
import { browser, Runtime } from "webextension-polyfill-ts";

import { Object, Array, String, Literal, Runtype, Static } from "funtypes";

import { isSome } from "common/types";

export type RuntimeMessage = {
    kind: string;
    data: any;
};

const SubscribeRequest = Object({
    subscribe: Array(String),
});

export class RuntimeSource {
    private subscriptions: Map<Runtime.Port, Subscription[]>;

    private message$: Stream<any>;

    constructor(update$: Stream<RuntimeMessage>) {
        const state$ = update$
            .fold((acc, { kind, data }) => {
                acc.set(kind, data);
                return acc;
            }, new Map<string, any>())
            .remember();

        // start stream
        state$.addListener({});

        this.subscriptions = new Map();
        this.message$ = xs.create({
            start: listener =>
                browser.runtime.onConnect.addListener(port => {
                    port.onDisconnect.addListener(() => {
                        this.subscriptions
                            .get(port)
                            ?.forEach(sub => sub.unsubscribe());

                        this.subscriptions.delete(port);
                    });

                    port.onMessage.addListener(message => {
                        if (SubscribeRequest.test(message)) {
                            message.subscribe.forEach(kind => {
                                const subs = this.subscriptions.get(port) ?? [];
                                if (!this.subscriptions.has(port)) {
                                    this.subscriptions.set(port, subs);
                                }
                                const sub = state$
                                    .map(state => state.get(kind))
                                    .filter(isSome)
                                    .subscribe({
                                        next: data =>
                                            port.postMessage({ kind, data }),
                                    });
                                subs?.push(sub);
                            });
                        } else {
                            listener.next(message);
                        }
                    });
                }),
            stop: () => {},
        });
        // see above
        this.message$.addListener({});
    }

    select<T extends Runtype<unknown>>(
        kind: string,
        type: T
    ): Stream<Static<T>> {
        const Message = Object({
            kind: Literal(kind),
            data: type,
        });

        return this.message$.filter(Message.test).map(({ data }) => data);
    }
}

export const RuntimeDriver = () => (update$: Stream<RuntimeMessage>) =>
    new RuntimeSource(update$);

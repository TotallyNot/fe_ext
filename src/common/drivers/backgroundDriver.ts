import { Stream, default as xs } from "xstream";
import { browser, Runtime } from "webextension-polyfill-ts";
import { Object, Literal, Runtype, Static } from "funtypes";

import pluck from "common/xs/pluck";

export type RuntimeMessage = {
    kind: string;
    data: any;
};

export class BackgroundSource {
    private port: Runtime.Port;

    private subscriptions: Set<string>;
    private message$: Stream<any>;

    constructor(update$: Stream<RuntimeMessage>) {
        this.port = browser.runtime.connect();

        this.message$ = xs.create({
            start: listener =>
                this.port.onMessage.addListener(message =>
                    listener.next(message)
                ),
            stop: () => {},
        });

        update$.addListener({
            next: this.port.postMessage.bind(this.port),
        });

        this.subscriptions = new Set();
    }

    select<T extends Runtype<unknown>>(
        kind: string,
        type: T
    ): Stream<Static<T>> {
        if (!this.subscriptions.has(kind)) {
            this.port.postMessage({ subscribe: [kind] });
            this.subscriptions.add(kind);
        }

        const Message = Object({
            kind: Literal(kind),
            data: type,
        });

        return this.message$.filter(Message.test).compose(pluck("data"));
    }
}

export const BackgroundDriver = () => (update$: Stream<RuntimeMessage>) =>
    new BackgroundSource(update$);

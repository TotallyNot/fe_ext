import { Stream, default as xs } from "xstream";
import { browser, Runtime } from "webextension-polyfill-ts";

import { RuntimeMessages, Resources, ResourceUpdate } from "common/models";

type Payload<R extends Resources> = RuntimeMessages[R]["data"];

export class BackgroundSource {
    private port: Runtime.Port;

    private stream: Stream<any>;

    constructor(
        label: string,
        resources: Resources[],
        update$: Stream<ResourceUpdate>
    ) {
        this.port = browser.runtime.connect(undefined, { name: label });

        this.stream = xs.create({
            start: listener =>
                this.port.onMessage.addListener(message =>
                    listener.next(message)
                ),
            stop: () => {},
        });

        this.port.postMessage({ subscribe: resources });

        update$.addListener({
            next: next =>
                Object.entries(next).forEach(([resource, data]) =>
                    this.port.postMessage({ resource, data })
                ),
        });
    }

    select<S extends Resources>(resource: S): Stream<Payload<S>> {
        return this.stream
            .filter(RuntimeMessages.fields[resource].test)
            .map(({ data }) => data);
    }
}

export const BackgroundDriver = (label: string, resources: Resources[]) => (
    update$: Stream<ResourceUpdate>
) => new BackgroundSource(label, resources, update$);

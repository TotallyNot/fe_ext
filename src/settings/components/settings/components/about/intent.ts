import { of } from "rxjs";

import { browser } from "webextension-polyfill-ts";

export const intent = () => {
    const manifest$ = of(browser.runtime.getManifest());

    return {
        manifest$,
    };
};

export type Inputs = ReturnType<typeof intent>;

import { Observable } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { mergeMap } from "rxjs/operators";

import { browser } from "webextension-polyfill-ts";

interface LicenseEntry {
    name: string;
    author: string;
    version: string;
    repository: string | null;
    source: string;
    license: string;
    licenseText: string;
}

export const intent = () => {
    const licenses$: Observable<LicenseEntry[]> = fromFetch(
        browser.runtime.getURL("licenses.json")
    ).pipe(mergeMap(response => response.json()));

    return {
        licenses$,
    };
};

export type Inputs = ReturnType<typeof intent>;

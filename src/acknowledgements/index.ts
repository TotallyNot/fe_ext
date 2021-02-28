import { run } from "@cycle/run";
import { makeDOMDriver } from "@cycle/dom";

import { licenses } from "./components/licenses";

run(licenses, {
    DOM: makeDOMDriver("#acknowledgements"),
});

import { run } from "@cycle/run";
import { makeDOMDriver } from "@cycle/dom";

import { BackgroundDriver } from "common/drivers/backgroundDriver";

import { Root } from "./components/Root";

run(Root, {
    DOM: makeDOMDriver("#popup"),
    background: BackgroundDriver("popup", ["apiKey"]),
});

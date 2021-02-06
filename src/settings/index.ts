import { run } from "@cycle/run";
import { makeDOMDriver } from "@cycle/dom";
import { makeServerHistoryDriver } from "@cycle/history";

import { BackgroundDriver } from "common/drivers/backgroundDriver";

import settings from "./components/settings";

run(settings, {
    DOM: makeDOMDriver("#settings"),
    background: BackgroundDriver(),
    history: makeServerHistoryDriver(),
});

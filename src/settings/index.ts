import { run } from "@cycle/run";
import { makeDOMDriver } from "@cycle/dom";
import { makeServerHistoryDriver } from "@cycle/history";

import { cssRule } from "typestyle";
import { normalize, setupPage } from "csstips";

import { background, text } from "common/styles";

import { BackgroundDriver } from "common/drivers/backgroundDriver";

import settings from "./components/settings";

normalize();
setupPage("#settings");
cssRule("body", {
    fontSize: 14,
    fontFamily: "Helvetica, sans-serif",
});
cssRule("#settings", {
    backgroundColor: background.toString(),
    color: text.toString(),
    overflow: "auto",
});
cssRule("input[type=checkbox], input[type=number], label", {
    verticalAlign: "middle",
});

run(settings, {
    DOM: makeDOMDriver("#settings"),
    background: BackgroundDriver(),
    history: makeServerHistoryDriver(),
});

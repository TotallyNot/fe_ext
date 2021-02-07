import { run } from "@cycle/run";
import { makeDOMDriver } from "@cycle/dom";
import { makeServerHistoryDriver } from "@cycle/history";

import { cssRule } from "typestyle";
import { setupPage, normalize } from "csstips";

import { BackgroundDriver } from "common/drivers/backgroundDriver";

import { background, text } from "./styles";

import Root from "./components/Root";

normalize();
setupPage("#popup");
cssRule("body", {
    width: 250,
    padding: 0,
    margin: 0,
});
cssRule("#popup", {
    backgroundColor: background.toString(),
    color: text.toString(),
});

run(Root, {
    DOM: makeDOMDriver("#popup"),
    background: BackgroundDriver(),
    history: makeServerHistoryDriver(),
});

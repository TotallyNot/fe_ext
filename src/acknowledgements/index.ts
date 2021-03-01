import { run } from "@cycle/run";
import { makeDOMDriver } from "@cycle/dom";

import { cssRule } from "typestyle";
import { normalize, setupPage } from "csstips";

import { background, text } from "common/styles";

import { licenses } from "./components/licenses";

normalize();
setupPage("#acknowledgements");
cssRule("body", {
    backgroundColor: background.toString(),
    color: text.toString(),
    padding: 10,
});

run(licenses, {
    DOM: makeDOMDriver("#acknowledgements"),
});

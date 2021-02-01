import xs from "xstream";

import { p } from "@cycle/dom";

export const view = () => xs.of(p("logged in!"));

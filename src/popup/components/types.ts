import { Stream, MemoryStream } from "xstream";

import { MainDOMSource, VNode } from "@cycle/dom";
import { HistoryInput } from "@cycle/history";

import { Location } from "history";

import {
    BackgroundSource,
    RuntimeMessage,
} from "common/drivers/backgroundDriver";

export interface Sources {
    DOM: MainDOMSource;
    background: BackgroundSource;
    history: MemoryStream<Location>;
}

export interface Sinks {
    DOM: Stream<VNode>;
    background: Stream<RuntimeMessage>;
    history: Stream<HistoryInput>;
}

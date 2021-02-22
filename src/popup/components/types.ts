import { Stream, MemoryStream } from "xstream";

import { MainDOMSource, VNode } from "@cycle/dom";
import { HistoryInput } from "@cycle/history";

import { Location } from "history";

import { APISource, APIRequest } from "common/drivers/apiDriver";
import { DBSource, DBAction } from "common/drivers/dbDriver";
import {
    BackgroundSource,
    RuntimeMessage,
} from "common/drivers/backgroundDriver";

export interface Sources {
    DOM: MainDOMSource;
    background: BackgroundSource;
    history: MemoryStream<Location>;
    api: APISource;
    DB: DBSource;
}

export interface Sinks {
    DOM: Stream<VNode>;
    background: Stream<RuntimeMessage>;
    history: Stream<HistoryInput>;
    api: Stream<APIRequest>;
    DB: Stream<DBAction>;
}

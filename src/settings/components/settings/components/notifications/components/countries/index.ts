import isolate from "@cycle/isolate";
import { Subject } from "rxjs";

import { obsToStream, streamToObs } from "common/connect";

import { Sources, intent } from "./intent";
import { model } from "./model";
import { view } from "./view";

import { select } from "./components/select";

export const countries = (sources: Sources) => {
    const inputs = intent(sources);
    const selectionProxy$ = new Subject<{ key: string; name: string }>();
    const { state$, selectProps$ } = model(inputs, selectionProxy$);

    const selectSources = { ...sources, props$: selectProps$ };
    const selectSinks = isolate(select, { DOM: "select" })(selectSources);
    selectSinks.selection$.subscribe(selectionProxy$);

    const DOM = obsToStream(view(state$, streamToObs(selectSinks.DOM)));

    selectSinks.selection$.subscribe(console.log);

    return { DOM };
};

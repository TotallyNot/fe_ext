import { pluck, distinctUntilChanged, map, skip } from "rxjs/operators";

import { obsToStream, streamToObs } from "common/connect";

import { intent, Sources } from "./intent";
import { model } from "./model";
import { view } from "./view";

const settings = (sources: Sources) => {
    const actions = intent(sources);
    const reducers = model(actions);
    const state$ = streamToObs(sources.state.stream);
    const DOM = obsToStream(view(state$));

    // get state stream started :/
    sources.state.stream.endWhen(DOM).addListener({});

    const background$ = state$.pipe(
        pluck("notificationOut"),
        skip(1),
        distinctUntilChanged(),
        map(data => ({ kind: "NotificationSettings", data }))
    );

    return {
        DOM,
        state: reducers,
        background: obsToStream(background$),
    };
};

export default settings;

import isolate from "@cycle/isolate";

import { obsToStream, streamToObs } from "common/connect";

import { intent, Sources } from "./intent";
import { model } from "./model";
import { view } from "./view";

import { countries } from "./components/countries";

const settings = (sources: Sources) => {
    const actions = intent(sources);
    const output = model(actions);

    const { DOM: countries$ } = isolate(countries, { DOM: "countries" })(
        sources
    );

    const DOM = obsToStream(view(output, streamToObs(countries$)));

    return {
        DOM,
        DB: output.DB,
    };
};

export default settings;

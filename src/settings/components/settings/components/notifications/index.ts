import isolate from "@cycle/isolate";
import { mergeSinks } from "cyclejs-utils";

import { obsToStream, streamToObs } from "common/connect";

import { intent, Sources } from "./intent";
import { model } from "./model";
import { view } from "./view";

import { countries } from "./components/countries";

const settings = (sources: Sources) => {
    const actions = intent(sources);
    const output = model(actions);

    const countriesSinks = isolate(countries, { DOM: "countries" })(sources);

    const DOM = obsToStream(view(output, streamToObs(countriesSinks.DOM)));

    const ownSinks = {
        DOM,
        DB: output.DB,
    };

    return mergeSinks([ownSinks, countriesSinks], { DOM: () => DOM });
};

export default settings;

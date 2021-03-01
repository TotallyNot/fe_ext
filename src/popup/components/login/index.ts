import { withState } from "@cycle/state";

import sampleCombine from "xstream/extra/sampleCombine";

import { APIRequest } from "common/drivers/apiDriver";
import { DBAction } from "common/drivers/dbDriver";

import { intent, Sources } from "./intent";
import { model } from "./model";
import { view } from "./view";

const login = (sources: Sources) => {
    const actions = intent(sources);
    const DOM = view(sources.state);

    // get state stream started :/
    sources.state.stream.endWhen(DOM).addListener({});
    const DB = actions.success$
        .compose(sampleCombine(actions.login$))
        .map<DBAction>(([user, apiKey]) => db =>
            db.player.upsert({
                id: user.id,
                name: user.name,
                team: user.team,
                user: { apiKey },
            })
        );

    return {
        DOM: DOM,
        state: model(actions).state,
        DB,
        api: actions.login$.map<APIRequest>(apiKey => ({
            apiKey,
            selection: "user",
        })),
    };
};

export default withState(login);

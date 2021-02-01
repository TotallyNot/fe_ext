import { HistoryInput } from "@cycle/history";

import { Sources, Sinks } from "./types";

import { APIKeyResponse } from "common/models/runtime";

const prelude = (sources: Sources): Partial<Sinks> => {
    const response$ = sources.background.select(
        "apiKeyResponse",
        APIKeyResponse
    );

    return {
        history: response$.map(
            (response): HistoryInput => (response.success ? "/popup" : "/login")
        ),
    };
};

export default prelude;

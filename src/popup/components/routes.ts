import { Sources, Sinks } from "./types";

import { RouteDefinitions, resolveImplementation } from "common/route";

export const routes: RouteDefinitions<Sources, Sinks> = {
    "/": {
        getComponent: () => import("./prelude").then(module => module.default),
    },
    "/login": {
        getComponent: () => import("./login").then(module => module.default),
    },
    "/popup": {
        getComponent: () => import("./popup").then(module => module.default),
    },
};

export const resolve = resolveImplementation(routes);

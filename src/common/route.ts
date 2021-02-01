import switchPath from "switch-path";

// A rip-off of cyclejs-community/typescript-starter-cycle

export interface Component<Sources, Sinks> {
    (sources: Sources): Partial<Sinks>;
}

interface RouteResolution<Sources, Sinks> {
    getComponent: () => Promise<Component<Sources, Sinks>>;
}

export interface RouteDefinitions<So, Si> {
    [path: string]: RouteResolution<So, Si> | RouteDefinitions<So, Si>;
}

export const resolveImplementation = <So extends {}, Si extends {}>(
    routes: RouteDefinitions<So, Si>
) => (route: string): RouteResolution<So, Si> => {
    const {
        value: { getComponent },
    } = switchPath(route, routes);
    return {
        getComponent,
    };
};

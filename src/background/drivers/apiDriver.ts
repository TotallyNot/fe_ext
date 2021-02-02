import { Stream, default as xs } from "xstream";
import { HTTPSource, makeHTTPDriver, RequestInput } from "@cycle/http";

import { API, Payload, FEError } from "common/models";
import { Result } from "common/types";

export type APIRequest = {
    id?: number;
    apiKey: String;
    selection: keyof API;
};

export type APIError = {
    code: number;
    reason?: string;
};

export type APIResult<T extends keyof API> = Result<Payload<T>, APIError>;

const toRequest = ({ selection, apiKey, id }: APIRequest): RequestInput => {
    const category = id ? `${selection}-${id}` : selection;
    const idQuery = id ? `id=${id}` : "";
    return {
        url: `https://www.finalearth.com/api/${category}?key=${apiKey}${idQuery}`,
        method: "GET",
        category,
    };
};

export class APISource {
    http: HTTPSource;

    constructor(apiRequest$: Stream<APIRequest>) {
        const request$ = apiRequest$.map(toRequest);
        this.http = makeHTTPDriver()(request$);
    }

    response<K extends keyof API>(
        selection: K,
        id?: number
    ): Stream<APIResult<K>> {
        const category = id ? `${selection}-${id}` : selection;
        const [error, payload] = API.fields[selection].alternatives;

        return this.http
            .select(category)
            .map(response$ =>
                response$
                    .map(({ body }) => body)
                    .replaceError(() =>
                        xs.of({
                            error: true,
                            reason: false,
                            data: { code: 500 },
                        })
                    )
            )
            .flatten()
            .map(
                (body): APIResult<K> => {
                    if (error.test(body)) {
                        return {
                            type: "failure",
                            data: { code: body.data.code },
                        };
                    } else if (payload.test(body)) {
                        return { type: "success", data: body.data };
                    } else {
                        return {
                            type: "failure",
                            data: { code: 500, reason: "couldn't parse body" },
                        };
                    }
                }
            );
    }

    errors(): Stream<FEError> {
        return this.http
            .select()
            .map(response$ =>
                response$
                    .map(({ body }) => body)
                    .replaceError(error =>
                        xs.of({
                            body: {
                                error: true,
                                reason: error.message ?? "unknown",
                                data: { code: -1 },
                            },
                        })
                    )
            )
            .flatten()
            .filter(FEError.test);
    }
}

export const APIDriver = () => (apiRequests$: Stream<APIRequest>) =>
    new APISource(apiRequests$);

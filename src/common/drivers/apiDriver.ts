import { Stream } from "xstream";
import { from, of, Observable } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import {
    mergeMap,
    map,
    filter,
    catchError,
    share,
    pluck,
} from "rxjs/operators";
import { adapt } from "@cycle/run/lib/adapt";

import { streamToObs, obsToStream } from "common/connect";
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

const toFetch = ({
    selection,
    apiKey,
    id,
}: APIRequest): Observable<Response> => {
    const idQuery = id ? `id=${id}` : "";
    return fromFetch(
        `https://www.finalearth.com/api/${selection}?key=${apiKey}${idQuery}`,
        {
            method: "GET",
        }
    );
};

const toCategory = (selection: string, id?: number) =>
    id ? `${selection}-${id}` : selection;

export class APISource {
    response$: Observable<{ body: any; category: string }>;

    constructor(apiRequest$: Stream<APIRequest>) {
        this.response$ = streamToObs(apiRequest$).pipe(
            mergeMap(request =>
                toFetch(request).pipe(
                    mergeMap(response =>
                        from(
                            response.json().catch(() => ({
                                error: true,
                                reason: response.statusText,
                                data: { code: response.status },
                            }))
                        )
                    ),
                    catchError(error =>
                        of({
                            error: true,
                            reason: error.message,
                            data: { code: -1 },
                        })
                    ),
                    map(body => ({
                        body,
                        category: toCategory(request.selection, request.id),
                    }))
                )
            ),
            share()
        );
    }

    response<K extends keyof API>(
        selection: K,
        id?: number
    ): Stream<APIResult<K>> {
        const category = id ? `${selection}-${id}` : selection;
        const [error, payload] = API.fields[selection].alternatives;

        const result$ = this.response$.pipe(
            filter(response => response.category === category),
            map(({ body }) => {
                if (error.test(body)) {
                    return {
                        type: "failure",
                        data: { code: body.data.code, reason: body.reason },
                    };
                } else if (payload.test(body)) {
                    return { type: "success", data: body.data };
                } else {
                    return {
                        type: "failure",
                        data: {
                            code: -1,
                            reason: "something went wrong!",
                        },
                    };
                }
            }),
            share()
        );

        return adapt(obsToStream(result$));
    }

    errors(): Stream<FEError> {
        const error$ = this.response$.pipe(
            pluck("body"),
            filter(FEError.test),
            share()
        );

        return adapt(obsToStream(error$));
    }
}

export const APIDriver = () => (apiRequests$: Stream<APIRequest>) =>
    new APISource(apiRequests$);

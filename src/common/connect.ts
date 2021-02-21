import { from, Observable } from "rxjs";
import { default as xs, Stream } from "xstream";

export function obsToStream<T>(obs: Observable<T>): Stream<T> {
    return xs.from((obs as unknown) as Stream<T>);
}

export function streamToObs<T>(stream: Stream<T>): Observable<T> {
    return from((stream as unknown) as Observable<T>);
}

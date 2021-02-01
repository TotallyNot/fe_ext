import { Stream, default as xs } from "xstream";

export const discardAll = <T = never>() => <S extends {}>(
    stream: Stream<S>
): Stream<T> => (stream.take(0) as unknown) as Stream<T>;

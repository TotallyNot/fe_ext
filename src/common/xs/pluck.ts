import { Stream } from "xstream";

const pluck = <T extends {}, S extends keyof T>(
    key: S
): ((ins: Stream<T>) => Stream<T[S]>) => stream$ =>
    stream$.map(({ [key]: value }) => value);

export default pluck;

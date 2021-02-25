export type Component<Sources, Sinks> = (sources: Sources) => Sinks;

export type ResultSuccess<Success> = { type: "success"; data: Success };
export type ResultFailure<Failure> = { type: "failure"; data: Failure };

export type Result<Success, Failure> =
    | ResultSuccess<Success>
    | ResultFailure<Failure>;

export function isSuccess<Success, Failure>(
    result: Result<Success, Failure>
): result is ResultSuccess<Success> {
    return result.type === "success";
}

export function isFailure<Success, Failure>(
    result: Result<Success, Failure>
): result is ResultFailure<Failure> {
    return result.type === "failure";
}

export function isSome<T>(value: T | undefined | null): value is T {
    return value !== undefined && value !== null;
}

import { Reducer } from "@cycle/state";

export const OptReducer = <S extends {}>(
    body: (prev: S) => S
): Reducer<S> => prev => {
    if (!prev) {
        return undefined;
    } else {
        return body(prev);
    }
};

export const InitReducer = <S extends {}>(initial: S): Reducer<S> => prev => {
    if (prev) {
        return prev;
    } else {
        return initial;
    }
};

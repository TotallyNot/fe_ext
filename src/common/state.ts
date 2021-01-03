import { Reducer } from "@cycle/state";
import produce from "immer";

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

class ReducerBuilder<S> {
    private reducers: ((state: S) => S)[];
    private initial: S;

    constructor(initial: S) {
        this.reducers = [];
        this.initial = initial;
    }

    add(red: (state: S) => S): this {
        this.reducers.push(red);
        return this;
    }

    addConst(state: S): this {
        this.add(() => state);
        return this;
    }

    subReducer<K extends keyof S>(
        key: K,
        body: (builder: ReducerBuilder<S[K]>) => void
    ): this {
        const builder = new ReducerBuilder(this.initial[key]);
        body(builder);
        const subReducer = builder.build();

        this.add(state => {
            const subState = subReducer(state[key]) ?? this.initial[key];
            state[key] = subState;
            return state;
        });

        return this;
    }

    build(): Reducer<S> {
        return state =>
            this.reducers.reduce(
                (prev, reducer) => reducer(prev),
                state ?? this.initial
            );
    }
}

export const createReducer = <S extends {}>(initial: S) =>
    new ReducerBuilder(initial);

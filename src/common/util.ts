export function deepCompare<T>(prev: T, curr: T): boolean {
    if (Array.isArray(prev) && Array.isArray(curr)) {
        return (
            prev.length === curr.length &&
            !prev.find((value, index) => !deepCompare(value, curr[index]))
        );
    } else if (typeof prev === "object" && typeof curr === "object") {
        return !Object.keys(Object.assign({}, prev, curr)).find(
            key => !deepCompare((prev as any)[key], (curr as any)[key])
        );
    } else {
        return prev === curr;
    }
}

export type Falsy = undefined | null | false;

export function compactify<T>(arr: (T | Falsy)[]): T[] {
    return arr.filter(element => element) as T[];
}

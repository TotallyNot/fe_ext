import { Coordinate, euclideanMetric } from "./geometry";

export interface KDTreeNode<T> {
    value: T;
    coordinate: Coordinate;
    axis: keyof Coordinate;

    leftChild?: KDTreeNode<T>;
    rightChild?: KDTreeNode<T>;
}

export type KDTree<T> = KDTreeNode<T>;

const AXES = ["x", "y", "z"] as const;

function buildRecursive<T>(
    pairs: (readonly [T, Coordinate])[],
    depth: number
): KDTreeNode<T> {
    const axis = AXES[depth % 3];

    const sorted = pairs.sort(([_v1, c1], [_v2, c2]) => c1[axis] - c2[axis]);
    const mid = Math.floor(sorted.length / 2);

    const left = sorted.slice(0, mid);
    const right = sorted.slice(mid + 1);

    return {
        value: sorted[mid][0],
        coordinate: sorted[mid][1],
        axis,

        leftChild:
            left.length > 0 ? buildRecursive(left, depth + 1) : undefined,
        rightChild:
            right.length > 0 ? buildRecursive(right, depth + 1) : undefined,
    };
}

export function buildKDTree<T>(
    values: T[],
    selector: (value: T) => Coordinate
): KDTree<T> {
    const pairs = values.map(value => [value, selector(value)] as const);

    return buildRecursive(pairs, 0);
}

export function findInRange<T>(
    node: KDTreeNode<T>,
    center: Coordinate,
    range: number
): T[] {
    const result: T[] = [];
    if (euclideanMetric(center, node.coordinate) < range)
        result.push(node.value);

    const split = node.coordinate[node.axis];
    const projection = center[node.axis];
    if (node.leftChild && projection - split < range) {
        result.push(...findInRange(node.leftChild, center, range));
    }
    if (node.rightChild && split - projection < range) {
        result.push(...findInRange(node.rightChild, center, range));
    }

    return result;
}

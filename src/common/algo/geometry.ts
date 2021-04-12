export interface Coordinate {
    x: number;
    y: number;
    z: number;
}

export interface GeoCoordinate {
    latitude: number;
    longitude: number;
}

export function euclideanMetric(c1: Coordinate, c2: Coordinate): number {
    return Math.sqrt(
        (c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2 + (c1.z - c2.z) ** 2
    );
}

export function projectToUnitSphere(geo: GeoCoordinate): Coordinate {
    const phi = (Math.PI / 180) * geo.longitude;
    const theta = Math.PI / 2 - (Math.PI / 180) * geo.latitude;
    return {
        x: Math.cos(phi) * Math.sin(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(theta),
    };
}

export function haversine(theta: number): number {
    return (1 - Math.cos(theta)) / 2;
}

const RADIUS_EARTH = 6371;

export function greatCircleDist(c1: GeoCoordinate, c2: GeoCoordinate): number {
    const phi1 = (Math.PI / 180) * c1.latitude;
    const phi2 = (Math.PI / 180) * c2.latitude;
    const theta1 = (Math.PI / 180) * c1.longitude;
    const theta2 = (Math.PI / 180) * c2.longitude;
    const a =
        haversine(phi2 - phi1) +
        Math.cos(phi1) * Math.cos(phi2) * haversine(theta2 - theta1);

    return 2 * RADIUS_EARTH * Math.asin(Math.sqrt(a));
}

export function gcToEuclidean(d: number): number {
    return 2 * Math.sin(d / (2 * RADIUS_EARTH));
}

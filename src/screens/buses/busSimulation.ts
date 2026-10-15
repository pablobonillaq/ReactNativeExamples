import type { LngLat } from '@maplibre/maplibre-react-native';

/**
 * Simulated GPS feed for buses running up and down a route.
 * Pure functions (no timers, injectable random) so they can be tested.
 */

export const UPDATE_INTERVAL_MS = 3000;

export type Direction = 'north' | 'south';

export type Bus = {
  id: string;
  label: string;
  color: string;
  /** Meters from the south end of the route. */
  distance: number;
  direction: Direction;
  speedKmh: number;
  /** Updates left stopped (bus stop or terminal). 0 = moving. */
  stoppedFor: number;
};

export type BusPosition = {
  lngLat: LngLat;
  /** Degrees clockwise from north, in the bus's direction of travel. */
  bearing: number;
};

export type Route = {
  points: LngLat[];
  /** Cumulative distance in meters at each point. */
  cumulative: number[];
  length: number;
};

// Content colors: each bus keeps its line color on the map, in the chips and
// in the detail badge. They are data, the same in both themes.
const BUS_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#64748b',
];

const MIN_SPEED = 12;
const MAX_SPEED = 50;
const STOP_CHANCE = 0.12;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in meters (haversine). */
export function distanceMeters(a: LngLat, b: LngLat) {
  const R = 6371000;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function bearingDegrees(a: LngLat, b: LngLat) {
  const y = Math.sin(toRad(b[0] - a[0])) * Math.cos(toRad(b[1]));
  const x =
    Math.cos(toRad(a[1])) * Math.sin(toRad(b[1])) -
    Math.sin(toRad(a[1])) *
      Math.cos(toRad(b[1])) *
      Math.cos(toRad(b[0] - a[0]));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function buildRoute(points: LngLat[]): Route {
  const cumulative = [0];
  for (let i = 1; i < points.length; i++) {
    cumulative.push(
      cumulative[i - 1] + distanceMeters(points[i - 1], points[i]),
    );
  }
  return { points, cumulative, length: cumulative[cumulative.length - 1] };
}

/** Point and heading at `distance` meters along the route. */
export function positionAt(
  route: Route,
  distance: number,
  direction: Direction,
): BusPosition {
  const d = Math.min(Math.max(distance, 0), route.length);
  // Binary search for the segment that contains d.
  let lo = 0;
  let hi = route.cumulative.length - 1;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (route.cumulative[mid] <= d) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  const a = route.points[lo];
  const b = route.points[hi];
  const segment = route.cumulative[hi] - route.cumulative[lo];
  const t = segment > 0 ? (d - route.cumulative[lo]) / segment : 0;
  const lngLat: LngLat = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const forward = bearingDegrees(a, b);
  return {
    lngLat,
    bearing: direction === 'north' ? forward : (forward + 180) % 360,
  };
}

/** `count` buses spread along the route, alternating directions. */
export function createBuses(
  route: Route,
  count: number,
  random: () => number = Math.random,
): Bus[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    label: `C-${String(i + 1).padStart(2, '0')}`,
    color: BUS_COLORS[i % BUS_COLORS.length],
    distance: ((i + 0.5) / count) * route.length,
    direction: i % 2 === 0 ? 'north' : 'south',
    speedKmh: MIN_SPEED + random() * (MAX_SPEED - MIN_SPEED),
    stoppedFor: 0,
  }));
}

/**
 * Advances every bus by `seconds`. Buses change speed a little (traffic),
 * sometimes stop for 1-2 updates (bus stops) and turn around at both ends
 * of the route after a short wait at the terminal.
 */
export function stepBuses(
  buses: Bus[],
  route: Route,
  seconds: number,
  random: () => number = Math.random,
): Bus[] {
  return buses.map(bus => {
    if (bus.stoppedFor > 0) {
      return { ...bus, stoppedFor: bus.stoppedFor - 1 };
    }
    if (random() < STOP_CHANCE) {
      return { ...bus, stoppedFor: 1 + Math.floor(random() * 2) };
    }

    const speedKmh = Math.min(
      MAX_SPEED,
      Math.max(MIN_SPEED, bus.speedKmh + (random() - 0.5) * 10),
    );
    const meters = (speedKmh / 3.6) * seconds;
    const sign = bus.direction === 'north' ? 1 : -1;
    const distance = bus.distance + sign * meters;

    if (distance >= route.length) {
      return {
        ...bus,
        speedKmh,
        distance: route.length,
        direction: 'south',
        stoppedFor: 2,
      };
    }
    if (distance <= 0) {
      return {
        ...bus,
        speedKmh,
        distance: 0,
        direction: 'north',
        stoppedFor: 2,
      };
    }
    return { ...bus, speedKmh, distance };
  });
}

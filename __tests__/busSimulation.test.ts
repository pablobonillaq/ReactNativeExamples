import {
  buildRoute,
  createBuses,
  positionAt,
  stepBuses,
  type Bus,
} from '../src/screens/buses/busSimulation';
import { INDEPENDENCIA_ROUTE } from '../src/screens/buses/independenciaRoute';

const route = buildRoute(INDEPENDENCIA_ROUTE);
const noRandom = () => 0.5; // no stops (0.5 > stop chance), no speed change

test('the route is Calzada Independencia (~10.6 km, south to north)', () => {
  expect(route.length).toBeGreaterThan(9500);
  expect(route.length).toBeLessThan(11500);
  const [start, end] = [route.points[0], route.points[route.points.length - 1]];
  expect(end[1]).toBeGreaterThan(start[1]); // ends further north
  // Inside Guadalajara.
  for (const [lng, lat] of route.points) {
    expect(lat).toBeGreaterThan(20.6);
    expect(lat).toBeLessThan(20.8);
    expect(lng).toBeGreaterThan(-103.4);
    expect(lng).toBeLessThan(-103.28);
  }
});

test('creates 10 buses along the route in both directions', () => {
  const buses = createBuses(route, 10, noRandom);
  expect(buses).toHaveLength(10);
  expect(new Set(buses.map(b => b.direction))).toEqual(
    new Set(['north', 'south']),
  );
  for (const bus of buses) {
    expect(bus.distance).toBeGreaterThan(0);
    expect(bus.distance).toBeLessThan(route.length);
  }
});

test('positionAt interpolates along the route', () => {
  expect(positionAt(route, 0, 'north').lngLat).toEqual(route.points[0]);
  expect(positionAt(route, route.length, 'north').lngLat).toEqual(
    route.points[route.points.length - 1],
  );
  const north = positionAt(route, 1000, 'north').bearing;
  const south = positionAt(route, 1000, 'south').bearing;
  // Opposite directions point 180° apart.
  const difference = (((north - south) % 360) + 360) % 360;
  expect(difference).toBeCloseTo(180, 9);
});

test('a 3-second step moves a bus by speed × time', () => {
  const bus: Bus = {
    id: '1',
    label: 'C-01',
    color: '#000',
    distance: 1000,
    direction: 'north',
    speedKmh: 36, // 10 m/s
    stoppedFor: 0,
  };
  const [moved] = stepBuses([bus], route, 3, noRandom);
  expect(moved.distance).toBeCloseTo(1030, 5);
  const [back] = stepBuses(
    [{ ...bus, direction: 'south' }],
    route,
    3,
    noRandom,
  );
  expect(back.distance).toBeCloseTo(970, 5);
});

test('buses turn around at the ends of the route', () => {
  const bus: Bus = {
    id: '1',
    label: 'C-01',
    color: '#000',
    distance: route.length - 5,
    direction: 'north',
    speedKmh: 36,
    stoppedFor: 0,
  };
  const [atEnd] = stepBuses([bus], route, 3, noRandom);
  expect(atEnd.distance).toBe(route.length);
  expect(atEnd.direction).toBe('south');
  expect(atEnd.stoppedFor).toBeGreaterThan(0);
});

import { useEffect, useState } from 'react';
import {
  createBuses,
  stepBuses,
  UPDATE_INTERVAL_MS,
  type Bus,
  type Route,
} from './busSimulation';
import { createLogger } from '../../observability/logger';

const log = createLogger('BusesSimulation');

/**
 * Stands in for a real-time feed (WebSocket, polling an API...): every
 * UPDATE_INTERVAL_MS it "receives" new positions for all buses.
 */
export function useSimulatedBuses(route: Route, count: number) {
  const [buses, setBuses] = useState<Bus[]>(() => createBuses(route, count));
  const [updatedAt, setUpdatedAt] = useState(() => Date.now());

  useEffect(() => {
    log.info('Simulation started', {
      buses: count,
      everyMs: UPDATE_INTERVAL_MS,
    });
    const id = setInterval(() => {
      setBuses(current => stepBuses(current, route, UPDATE_INTERVAL_MS / 1000));
      setUpdatedAt(Date.now());
    }, UPDATE_INTERVAL_MS);
    return () => {
      clearInterval(id);
      log.info('Simulation stopped');
    };
  }, [route, count]);

  return { buses, updatedAt };
}

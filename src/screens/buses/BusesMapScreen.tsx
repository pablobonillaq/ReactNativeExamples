import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  Marker,
  type CameraRef,
  type LngLatBounds,
} from '@maplibre/maplibre-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  buildRoute,
  positionAt,
  UPDATE_INTERVAL_MS,
  type Bus,
} from './busSimulation';
import { INDEPENDENCIA_ROUTE } from './independenciaRoute';
import { useSimulatedBuses } from './useSimulatedBuses';
import { makeStyles } from '../../theme';

const BUS_COUNT = 10;

// Content colors drawn on the map: the route line and the text / border of
// the bus markers and badges (white on the bus color). The map style is the
// same in both themes, so they stay fixed.
const ROUTE_CASING_COLOR = '#1e3a8a';
const ROUTE_LINE_COLOR = '#2563eb';
const ON_BUS_COLOR = '#ffffff';
const SELECTED_MARKER_BORDER = '#111827';

/** OpenFreeMap: free OpenStreetMap vector tiles, no API key needed. */
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

const ROUTE = buildRoute(INDEPENDENCIA_ROUTE);

const ROUTE_GEOJSON: GeoJSON.Feature<GeoJSON.LineString> = {
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: INDEPENDENCIA_ROUTE },
};

const ROUTE_BOUNDS: LngLatBounds = (() => {
  const lngs = INDEPENDENCIA_ROUTE.map(p => p[0]);
  const lats = INDEPENDENCIA_ROUTE.map(p => p[1]);
  return [
    Math.min(...lngs),
    Math.min(...lats),
    Math.max(...lngs),
    Math.max(...lats),
  ];
})();

const BOUNDS_PADDING = { top: 110, bottom: 150, left: 40, right: 40 };

/**
 * 10 simulated buses on Calzada Independencia (Guadalajara). Positions come
 * from a simulated real-time feed that updates every 3 seconds.
 */
export function BusesMapScreen() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraRef>(null);
  const { buses, updatedAt } = useSimulatedBuses(ROUTE, BUS_COUNT);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const secondsAgo = useSecondsSince(updatedAt);
  const styles = useStyles();
  const { t } = useTranslation('buses');

  const positions = useMemo(
    () =>
      Object.fromEntries(
        buses.map(bus => [
          bus.id,
          positionAt(ROUTE, bus.distance, bus.direction),
        ]),
      ),
    [buses],
  );

  // Follow the selected bus on every update.
  useEffect(() => {
    if (selectedId) {
      cameraRef.current?.easeTo({
        center: positions[selectedId].lngLat,
        zoom: 15.5,
        duration: 800,
      });
    }
  }, [selectedId, positions]);

  const showAll = () => {
    setSelectedId(null);
    cameraRef.current?.fitBounds(ROUTE_BOUNDS, {
      padding: BOUNDS_PADDING,
      duration: 800,
    });
  };

  const selected = buses.find(b => b.id === selectedId);

  return (
    <View style={styles.container}>
      <Map
        style={StyleSheet.absoluteFill}
        mapStyle={MAP_STYLE}
        touchRotate={false}
        touchPitch={false}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            bounds: ROUTE_BOUNDS,
            padding: BOUNDS_PADDING,
          }}
        />

        <GeoJSONSource id="independencia" data={ROUTE_GEOJSON}>
          <Layer
            id="independencia-casing"
            type="line"
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            paint={{
              'line-color': ROUTE_CASING_COLOR,
              'line-width': 9,
              'line-opacity': 0.35,
            }}
          />
          <Layer
            id="independencia-line"
            type="line"
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            paint={{ 'line-color': ROUTE_LINE_COLOR, 'line-width': 4 }}
          />
        </GeoJSONSource>

        {buses.map(bus => (
          <Marker
            key={bus.id}
            id={`bus-${bus.id}`}
            lngLat={positions[bus.id].lngLat}
            anchor="center"
            onPress={() => setSelectedId(bus.id)}
          >
            <BusMarker
              bus={bus}
              bearing={positions[bus.id].bearing}
              selected={bus.id === selectedId}
            />
          </Marker>
        ))}
      </Map>

      {/* Live status */}
      <View style={styles.status} pointerEvents="box-none">
        <View style={styles.statusCard}>
          <View style={styles.liveDot} />
          <Text style={styles.statusText}>
            {t('status.live', { count: buses.length })}
          </Text>
        </View>
        <Text style={styles.updatedText}>
          {t('status.updated', {
            seconds: secondsAgo,
            interval: UPDATE_INTERVAL_MS / 1000,
          })}
        </Text>
      </View>

      {/* Bus list */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        {selected ? (
          <View style={styles.detail}>
            <View
              style={[styles.detailBadge, { backgroundColor: selected.color }]}
            >
              <Text style={styles.detailBadgeText}>{selected.label}</Text>
            </View>
            <View style={styles.detailBody}>
              <Text style={styles.detailTitle}>
                {selected.direction === 'north'
                  ? t('detail.north')
                  : t('detail.south')}
              </Text>
              <Text style={styles.detailText}>
                {t('detail.info', {
                  state:
                    selected.stoppedFor > 0
                      ? t('detail.stopped')
                      : t('speed', { speed: Math.round(selected.speedKmh) }),
                  km: (selected.distance / 1000).toFixed(1),
                })}
              </Text>
            </View>
            <Pressable onPress={showAll} hitSlop={8} style={styles.showAll}>
              <Text style={styles.showAllText}>{t('detail.showAll')}</Text>
            </Pressable>
          </View>
        ) : null}
        <FlatList
          data={buses}
          horizontal
          keyExtractor={bus => bus.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedId(item.id)}
              style={[
                styles.chip,
                item.id === selectedId && { borderColor: item.color },
              ]}
            >
              <View style={[styles.chipDot, { backgroundColor: item.color }]} />
              <Text style={styles.chipLabel}>{item.label}</Text>
              <Text style={styles.chipInfo}>
                {item.direction === 'north' ? '↑' : '↓'}{' '}
                {item.stoppedFor > 0
                  ? t('chip.stopped')
                  : t('speed', { speed: Math.round(item.speedKmh) })}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </View>
  );
}

function BusMarker({
  bus,
  bearing,
  selected,
}: {
  bus: Bus;
  bearing: number;
  selected: boolean;
}) {
  const styles = useStyles();
  return (
    <View style={styles.marker}>
      {/* Arrow pointing where the bus is heading (map is always north-up). */}
      <View
        style={[styles.arrowWrap, { transform: [{ rotate: `${bearing}deg` }] }]}
      >
        <View style={[styles.arrow, { borderBottomColor: bus.color }]} />
      </View>
      <View
        style={[
          styles.markerBody,
          { backgroundColor: bus.color },
          selected && styles.markerSelected,
        ]}
      >
        <Text style={styles.markerText}>🚌 {bus.id}</Text>
      </View>
    </View>
  );
}

function useSecondsSince(time: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [time]);
  return Math.max(0, Math.round((now - time) / 1000));
}

const useStyles = makeStyles((c, theme) => ({
  container: {
    flex: 1,
    backgroundColor: c.surfaceMuted,
  },
  status: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    alignItems: 'center',
    gap: 4,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    // Inverse pill: dark on the light theme, light on the dark one.
    backgroundColor: c.text,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: c.success,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: c.background,
  },
  updatedText: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 11,
    fontWeight: '600',
    color: c.text,
    backgroundColor: c.surface,
    borderWidth: theme.isDark ? 1 : 0,
    borderColor: c.border,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: 10,
    paddingTop: 12,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: c.surface,
    elevation: theme.isDark ? 0 : 4,
    borderWidth: theme.isDark ? 1 : 0,
    borderColor: c.border,
  },
  detailBadge: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  detailBadgeText: {
    fontSize: 15,
    fontWeight: '800',
    color: ON_BUS_COLOR,
  },
  detailBody: {
    flex: 1,
    gap: 2,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: c.text,
  },
  detailText: {
    fontSize: 12,
    color: c.textSecondary,
  },
  showAll: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: c.primarySoft,
  },
  showAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: c.primary,
  },
  chips: {
    gap: 8,
    paddingHorizontal: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: theme.isDark ? c.border : 'transparent',
    borderRadius: 999,
    backgroundColor: c.surface,
    elevation: theme.isDark ? 0 : 3,
  },
  chipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: c.text,
  },
  chipInfo: {
    fontSize: 12,
    color: c.textMuted,
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
  },
  arrowWrap: {
    position: 'absolute',
    width: 64,
    height: 64,
    alignItems: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  markerBody: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 2,
    borderColor: ON_BUS_COLOR,
    borderRadius: 10,
  },
  markerSelected: {
    borderColor: SELECTED_MARKER_BORDER,
    transform: [{ scale: 1.25 }],
  },
  markerText: {
    fontSize: 12,
    fontWeight: '800',
    color: ON_BUS_COLOR,
  },
}));

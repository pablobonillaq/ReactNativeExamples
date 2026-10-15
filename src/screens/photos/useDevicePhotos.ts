import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { createLogger } from '../../observability/logger';

const log = createLogger('DevicePhotos');

const PAGE_SIZE = 30;

export type DevicePhoto = { uri: string };

type PermissionState = 'checking' | 'granted' | 'denied';

/**
 * Asks for permission to read the device photos:
 * - Android 14+: READ_MEDIA_IMAGES, or partial access to the photos the
 *   user selected (READ_MEDIA_VISUAL_USER_SELECTED).
 * - Android 13: READ_MEDIA_IMAGES.
 * - Android 12 and older: READ_EXTERNAL_STORAGE.
 * - iOS: CameraRoll asks by itself (NSPhotoLibraryUsageDescription).
 */
async function requestPhotosPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }
  const { PERMISSIONS, RESULTS } = PermissionsAndroid;
  const version = Number(Platform.Version);
  if (version >= 34) {
    const result = await PermissionsAndroid.requestMultiple([
      PERMISSIONS.READ_MEDIA_IMAGES,
      PERMISSIONS.READ_MEDIA_VISUAL_USER_SELECTED,
    ]);
    log.info('Photos permission result', { version, ...result });
    return Object.values(result).includes(RESULTS.GRANTED);
  }
  const permission =
    version >= 33
      ? PERMISSIONS.READ_MEDIA_IMAGES
      : PERMISSIONS.READ_EXTERNAL_STORAGE;
  const result = await PermissionsAndroid.request(permission);
  log.info('Photos permission result', { version, permission, result });
  return result === RESULTS.GRANTED;
}

/** Most recent photos of the device, loaded page by page. */
export function useDevicePhotos(enabled: boolean) {
  const [permission, setPermission] = useState<PermissionState>('checking');
  const [photos, setPhotos] = useState<DevicePhoto[]>([]);
  const cursor = useRef<string | undefined>(undefined);
  const hasMore = useRef(true);
  const loading = useRef(false);

  const loadMore = useCallback(async () => {
    if (loading.current || !hasMore.current) {
      return;
    }
    loading.current = true;
    try {
      const page = await CameraRoll.getPhotos({
        first: PAGE_SIZE,
        after: cursor.current,
        assetType: 'Photos',
      });
      cursor.current = page.page_info.end_cursor;
      hasMore.current = page.page_info.has_next_page;
      log.debug('Device photos page', {
        count: page.edges.length,
        hasMore: page.page_info.has_next_page,
      });
      setPhotos(current => [
        ...current,
        ...page.edges.map(edge => ({ uri: edge.node.image.uri })),
      ]);
    } catch (error) {
      log.error('Could not read the device photos', error);
    } finally {
      loading.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    // Start from scratch every time the sheet opens, so it always shows the
    // latest photos (the sheet stays mounted while closed).
    cursor.current = undefined;
    hasMore.current = true;
    setPhotos([]);
    let cancelled = false;
    requestPhotosPermission()
      .catch(error => {
        log.error('Photos permission request failed', error);
        return false;
      })
      .then(granted => {
        if (cancelled) {
          return;
        }
        setPermission(granted ? 'granted' : 'denied');
        if (granted) {
          loadMore();
        }
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, loadMore]);

  return { permission, photos, loadMore };
}

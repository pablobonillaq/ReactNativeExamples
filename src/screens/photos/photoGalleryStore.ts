import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  copyFile,
  DocumentDirectoryPath,
  exists,
  mkdir,
  unlink,
} from '@dr.pogodin/react-native-fs';
import { useEffect, useSyncExternalStore } from 'react';
import { createLogger } from '../../observability/logger';

const log = createLogger('PhotoGallery');

/**
 * The app's own photo gallery.
 *
 * - Image files are copied into the app's documents folder. URIs from the
 *   camera or the device gallery can be temporary (cache files, content://
 *   URIs whose permission expires), so keeping our own copy guarantees the
 *   photos are still there next time.
 * - The list of photos (a small JSON array of file paths) is saved with
 *   AsyncStorage, React Native's localStorage. Storing the images themselves
 *   in AsyncStorage (as base64) would be slow and hit size limits.
 */

export type GalleryPhoto = {
  id: string;
  /** Absolute file path inside the app's documents folder. */
  path: string;
  addedAt: number;
};

export const GALLERY_STORAGE_KEY = '@ReactNativeExamples/photoGallery';
const PHOTOS_DIR = `${DocumentDirectoryPath}/gallery`;

let photos: GalleryPhoto[] = [];
let loadRequest: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setPhotos(next: GalleryPhoto[]) {
  photos = next;
  listeners.forEach(listener => listener());
  AsyncStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(photos)).catch(
    error => log.error('Could not save the gallery', error),
  );
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return photos;
}

/** Loads the saved list once, dropping entries whose file no longer exists. */
export function loadGallery() {
  if (!loadRequest) {
    loadRequest = (async () => {
      const json = await AsyncStorage.getItem(GALLERY_STORAGE_KEY);
      const saved: GalleryPhoto[] = json ? JSON.parse(json) : [];
      const checks = await Promise.all(saved.map(p => exists(p.path)));
      const missing = checks.filter(ok => !ok).length;
      if (missing > 0) {
        log.warn('Some saved photos no longer exist', { missing });
      }
      setPhotos([...saved.filter((_, i) => checks[i]), ...photos]);
      log.info('Gallery loaded', { count: photos.length });
    })().catch(error => {
      loadRequest = null;
      log.error('Could not load the gallery', error);
    });
  }
  return loadRequest;
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Returns the path where a new photo should be stored. */
export async function newPhotoPath() {
  if (!(await exists(PHOTOS_DIR))) {
    await mkdir(PHOTOS_DIR);
  }
  const id = newId();
  return { id, path: `${PHOTOS_DIR}/${id}.jpg` };
}

/** Adds a photo that has already been written to `path`. */
export function addSavedPhoto(id: string, path: string) {
  setPhotos([...photos, { id, path, addedAt: Date.now() }]);
  log.info('Photo added', { id, count: photos.length });
}

/** Copies an image (file:// or content:// URI) into the gallery. */
export async function addPhotoFromUri(uri: string) {
  const { id, path } = await newPhotoPath();
  log.debug('Copying photo into the gallery', { uri, path });
  await copyFile(uri, path);
  addSavedPhoto(id, path);
}

export async function removePhoto(id: string) {
  const photo = photos.find(p => p.id === id);
  setPhotos(photos.filter(p => p.id !== id));
  log.info('Photo removed', { id, count: photos.length });
  if (photo && (await exists(photo.path))) {
    await unlink(photo.path);
  }
}

export function useGalleryPhotos() {
  const current = useSyncExternalStore(subscribe, getSnapshot);
  useEffect(() => {
    loadGallery();
  }, []);
  return current;
}

/** Test helper: forget the in-memory state so it's loaded again. */
export function resetGalleryStoreForTests() {
  photos = [];
  loadRequest = null;
  listeners.clear();
}

/** file:// URI for <Image source={{ uri }} />. */
export function photoUri(photo: GalleryPhoto) {
  return `file://${photo.path}`;
}

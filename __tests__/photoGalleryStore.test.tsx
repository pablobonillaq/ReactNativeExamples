import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, create } from 'react-test-renderer';
import {
  addPhotoFromUri,
  GALLERY_STORAGE_KEY,
  loadGallery,
  removePhoto,
  resetGalleryStoreForTests,
  useGalleryPhotos,
  type GalleryPhoto,
} from '../src/screens/photos/photoGalleryStore';

const fs = require('@dr.pogodin/react-native-fs');

function renderGallery() {
  const ref: { current: GalleryPhoto[] } = { current: [] };
  function Probe() {
    ref.current = useGalleryPhotos();
    return null;
  }
  act(() => {
    create(<Probe />);
  });
  return ref;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  fs.__reset();
  resetGalleryStoreForTests();
});

test('copies the image into the app folder and saves the list', async () => {
  const gallery = renderGallery();
  await act(() => loadGallery());

  await act(() => addPhotoFromUri('content://media/external/images/1'));

  expect(gallery.current).toHaveLength(1);
  const [photo] = gallery.current;
  expect(photo.path).toMatch(/^\/documents\/gallery\/.+\.jpg$/);
  expect(fs.__files.has(photo.path)).toBe(true);

  const saved = JSON.parse((await AsyncStorage.getItem(GALLERY_STORAGE_KEY))!);
  expect(saved).toEqual([photo]);
});

test('removing deletes the file and the entry', async () => {
  const gallery = renderGallery();
  await act(() => loadGallery());
  await act(() => addPhotoFromUri('content://a'));
  const [photo] = gallery.current;

  await act(() => removePhoto(photo.id));

  expect(gallery.current).toEqual([]);
  expect(fs.__files.has(photo.path)).toBe(false);
  expect(
    JSON.parse((await AsyncStorage.getItem(GALLERY_STORAGE_KEY))!),
  ).toEqual([]);
});

test('on load, entries whose file is missing are dropped', async () => {
  fs.__files.add('/documents/gallery/kept.jpg');
  await AsyncStorage.setItem(
    GALLERY_STORAGE_KEY,
    JSON.stringify([
      { id: 'kept', path: '/documents/gallery/kept.jpg', addedAt: 1 },
      { id: 'gone', path: '/documents/gallery/gone.jpg', addedAt: 2 },
    ]),
  );

  const gallery = renderGallery();
  await act(() => loadGallery());

  expect(gallery.current.map(p => p.id)).toEqual(['kept']);
});

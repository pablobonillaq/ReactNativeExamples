import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Image,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  photoUri,
  removePhoto,
  useGalleryPhotos,
  type GalleryPhoto,
} from './photoGalleryStore';
import { PhotoPickerSheet } from './PhotoPickerSheet';
import { makeStyles } from '../../theme';

const COLUMNS = 3;
const GAP = 4;
const PADDING = 12;

// Content-on-image colors: the remove button is drawn on top of the photo,
// so it keeps a dark scrim with a white icon in both themes.
const PHOTO_SCRIM = 'rgba(0,0,0,0.6)';
const ON_PHOTO = '#ffffff';

/**
 * Photo gallery saved on the device. "Add photo" opens a Telegram-style
 * sheet (live camera + recent photos); every photo added is kept in rows of
 * 3 and survives closing the app.
 */
export function PhotoGalleryScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const photos = useGalleryPhotos();
  const [pickerVisible, setPickerVisible] = useState(false);
  const styles = useStyles();
  const { t } = useTranslation('photos');

  const size = (width - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        numColumns={COLUMNS}
        keyExtractor={photo => photo.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 96 },
        ]}
        ListHeaderComponent={
          <Text style={styles.caption}>
            {t('gallery.caption', { count: photos.length })}
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🖼️</Text>
            <Text style={styles.emptyText}>{t('gallery.empty')}</Text>
          </View>
        }
        renderItem={({ item }) => <GalleryItem photo={item} size={size} />}
      />

      <Pressable
        onPress={() => setPickerVisible(true)}
        style={({ pressed }) => [
          styles.addButton,
          { bottom: insets.bottom + 20 },
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.addButtonText}>{t('gallery.add')}</Text>
      </Pressable>

      <PhotoPickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  );
}

function GalleryItem({ photo, size }: { photo: GalleryPhoto; size: number }) {
  const styles = useStyles();
  const { t } = useTranslation('photos');
  return (
    <View style={{ width: size, height: size }}>
      <Image source={{ uri: photoUri(photo) }} style={styles.image} />
      <Pressable
        onPress={() => removePhoto(photo.id)}
        hitSlop={8}
        style={styles.removeButton}
        accessibilityLabel={t('gallery.remove')}
      >
        <Text style={styles.removeText}>✕</Text>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((c, theme) => ({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  content: {
    padding: PADDING,
    gap: GAP,
  },
  row: {
    gap: GAP,
  },
  caption: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
    color: c.textMuted,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    backgroundColor: c.surfaceMuted,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: PHOTO_SCRIM,
  },
  removeText: {
    fontSize: 12,
    fontWeight: '700',
    color: ON_PHOTO,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 64,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: c.textMuted,
  },
  addButton: {
    position: 'absolute',
    left: 24,
    right: 24,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: c.primary,
    elevation: theme.isDark ? 0 : 4,
  },
  pressed: {
    opacity: 0.85,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: c.textOnPrimary,
  },
}));

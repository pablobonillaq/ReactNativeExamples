import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
  type TargetCameraPosition,
} from 'react-native-vision-camera';
import {
  addPhotoFromUri,
  addSavedPhoto,
  newPhotoPath,
} from './photoGalleryStore';
import { useDevicePhotos, type DevicePhoto } from './useDevicePhotos';
import { createLogger } from '../../observability/logger';
import { makeStyles, useTheme } from '../../theme';

const log = createLogger('PhotoPicker');

const COLUMNS = 3;
const GAP = 2;

// Content-on-camera colors: the camera tile and the full-screen camera show
// the live preview (or a black frame), so their controls stay white on a dark
// scrim in both themes.
const CAMERA_BACKGROUND = '#000000';
const CAMERA_TILE_BACKGROUND = '#111827';
const CAMERA_SCRIM = 'rgba(0,0,0,0.35)';
const ON_CAMERA = '#ffffff';

type Props = {
  visible: boolean;
  onClose: () => void;
};

type Cell = { type: 'camera' } | { type: 'photo'; photo: DevicePhoto };

/**
 * Telegram-style attachment sheet: a grid whose first cell is a live camera
 * preview (tap it to open the full camera) followed by the most recent
 * photos of the device (tap one to add it to the gallery).
 */
export function PhotoPickerSheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [mode, setMode] = useState<'pick' | 'camera'>('pick');
  const [busy, setBusy] = useState(false);
  const { permission, photos, loadMore } = useDevicePhotos(visible);
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation('photos');

  const cellSize = (width - GAP * (COLUMNS - 1)) / COLUMNS;
  const cells: Cell[] = [
    { type: 'camera' },
    ...photos.map(photo => ({ type: 'photo' as const, photo })),
  ];

  const close = () => {
    setMode('pick');
    onClose();
  };

  const pickDevicePhoto = async (photo: DevicePhoto) => {
    setBusy(true);
    try {
      await addPhotoFromUri(photo.uri);
      close();
    } catch (error) {
      log.error('Could not add the photo', error, { uri: photo.uri });
      Toast.show({ type: 'error', text1: t('picker.addError') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={mode === 'camera' ? () => setMode('pick') : close}
      statusBarTranslucent
    >
      {mode === 'camera' ? (
        <FullScreenCamera onCancel={() => setMode('pick')} onCaptured={close} />
      ) : (
        <View style={styles.backdrop}>
          <Pressable style={styles.backdropTouch} onPress={close} />
          <View
            style={[
              styles.sheet,
              { height: height * 0.7, paddingBottom: insets.bottom },
            ]}
          >
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.title}>{t('picker.title')}</Text>
              <Pressable onPress={close} hitSlop={10}>
                <Text style={styles.closeText}>{t('picker.cancel')}</Text>
              </Pressable>
            </View>

            <FlatList
              data={cells}
              numColumns={COLUMNS}
              keyExtractor={(cell, index) =>
                cell.type === 'camera' ? 'camera' : `${cell.photo.uri}-${index}`
              }
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.grid}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              renderItem={({ item }) =>
                item.type === 'camera' ? (
                  <CameraTile
                    size={cellSize}
                    onPress={() => setMode('camera')}
                  />
                ) : (
                  <Pressable onPress={() => pickDevicePhoto(item.photo)}>
                    <Image
                      source={{ uri: item.photo.uri }}
                      style={{ width: cellSize, height: cellSize }}
                    />
                  </Pressable>
                )
              }
              ListFooterComponent={
                permission === 'denied' ? (
                  <PermissionNotice text={t('picker.permissionDenied')} />
                ) : permission === 'checking' ? (
                  <ActivityIndicator
                    style={styles.loading}
                    color={colors.primary}
                  />
                ) : photos.length === 0 ? (
                  <Text style={styles.emptyText}>{t('picker.noPhotos')}</Text>
                ) : undefined
              }
            />

            {busy ? (
              <View style={styles.busy}>
                <ActivityIndicator size="large" color={ON_CAMERA} />
              </View>
            ) : null}
          </View>
        </View>
      )}
    </Modal>
  );
}

/** First cell of the grid: what the camera is seeing right now. */
function CameraTile({ size, onPress }: { size: number; onPress: () => void }) {
  const { hasPermission, canRequestPermission, requestPermission } =
    useCameraPermission();
  const device = useCameraDevice('back');
  const styles = useStyles();
  const { t } = useTranslation('photos');

  if (!hasPermission) {
    return (
      <Pressable
        onPress={() =>
          canRequestPermission ? requestPermission() : Linking.openSettings()
        }
        style={[styles.cameraTile, { width: size, height: size }]}
      >
        <Text style={styles.cameraIcon}>📷</Text>
        <Text style={styles.cameraTileText}>
          {canRequestPermission
            ? t('camera.allow')
            : t('camera.enableInSettings')}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[styles.cameraTile, { width: size, height: size }]}
    >
      {device ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          outputs={[]}
          resizeMode="cover"
        />
      ) : null}
      <Text style={[styles.cameraIcon, styles.cameraIconOverlay]}>📷</Text>
    </Pressable>
  );
}

/** Full camera opened from the tile, with shutter and flip buttons. */
function FullScreenCamera({
  onCancel,
  onCaptured,
}: {
  onCancel: () => void;
  onCaptured: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [position, setPosition] = useState<TargetCameraPosition>('back');
  const device = useCameraDevice(position);
  const photoOutput = usePhotoOutput();
  const [capturing, setCapturing] = useState(false);
  const capturingRef = useRef(false);
  const styles = useStyles();
  const { t } = useTranslation('photos');

  const capture = async () => {
    if (capturingRef.current) {
      return;
    }
    capturingRef.current = true;
    setCapturing(true);
    try {
      log.info('Taking a photo', { position, device: device?.id });
      const photo = await photoOutput.capturePhoto({}, {});
      const { id, path } = await newPhotoPath();
      await photo.saveToFileAsync(path);
      photo.dispose();
      addSavedPhoto(id, path);
      onCaptured();
    } catch (error) {
      log.error('Could not take the photo', error, { position });
      Toast.show({ type: 'error', text1: t('camera.captureError') });
    } finally {
      capturingRef.current = false;
      setCapturing(false);
    }
  };

  return (
    <View style={styles.fullCamera}>
      {device ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          outputs={[photoOutput]}
          resizeMode="cover"
        />
      ) : (
        <Text style={styles.noCamera}>{t('camera.unavailable')}</Text>
      )}
      <View
        style={[styles.cameraControls, { paddingBottom: insets.bottom + 24 }]}
      >
        <Pressable onPress={onCancel} hitSlop={10} style={styles.sideButton}>
          <Text style={styles.sideButtonText}>{t('camera.cancel')}</Text>
        </Pressable>
        <Pressable
          onPress={capture}
          disabled={capturing || !device}
          style={[styles.shutter, capturing && styles.shutterBusy]}
          accessibilityLabel={t('camera.takePhoto')}
        >
          <View style={styles.shutterInner} />
        </Pressable>
        <Pressable
          onPress={() => setPosition(p => (p === 'back' ? 'front' : 'back'))}
          hitSlop={10}
          style={styles.sideButton}
          accessibilityLabel={t('camera.flip')}
        >
          <Text style={styles.flipText}>🔄</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PermissionNotice({ text }: { text: string }) {
  const styles = useStyles();
  const { t } = useTranslation('photos');
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>{text}</Text>
      <Pressable
        onPress={() => Linking.openSettings()}
        style={styles.noticeButton}
      >
        <Text style={styles.noticeButtonText}>{t('picker.openSettings')}</Text>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles(c => ({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: c.overlay,
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: c.surface,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    marginTop: 8,
    borderRadius: 2,
    backgroundColor: c.borderStrong,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: c.text,
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
    color: c.primary,
  },
  grid: {
    gap: GAP,
  },
  row: {
    gap: GAP,
  },
  cameraTile: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: CAMERA_TILE_BACKGROUND,
  },
  cameraIcon: {
    fontSize: 28,
  },
  cameraIconOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    fontSize: 20,
  },
  cameraTileText: {
    marginTop: 4,
    paddingHorizontal: 6,
    fontSize: 11,
    textAlign: 'center',
    color: ON_CAMERA,
  },
  loading: {
    padding: 24,
  },
  emptyText: {
    padding: 24,
    textAlign: 'center',
    color: c.textMuted,
  },
  notice: {
    alignItems: 'center',
    gap: 10,
    padding: 24,
  },
  noticeText: {
    textAlign: 'center',
    color: c.textSecondary,
  },
  noticeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: c.primary,
  },
  noticeButtonText: {
    fontWeight: '600',
    color: c.textOnPrimary,
  },
  busy: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.overlay,
  },
  fullCamera: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: CAMERA_BACKGROUND,
  },
  noCamera: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: ON_CAMERA,
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 24,
    backgroundColor: CAMERA_SCRIM,
  },
  sideButton: {
    width: 70,
    alignItems: 'center',
  },
  sideButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: ON_CAMERA,
  },
  flipText: {
    fontSize: 28,
  },
  shutter: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderRadius: 38,
    borderColor: ON_CAMERA,
  },
  shutterBusy: {
    opacity: 0.5,
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: ON_CAMERA,
  },
}));

import Clipboard from '@react-native-clipboard/clipboard';
import {
  CachesDirectoryPath,
  downloadFile,
  exists,
  mkdir,
  readFile,
} from '@dr.pogodin/react-native-fs';
import { NativeModules, Platform, Share } from 'react-native';
import RNShare from 'react-native-share';
import i18n from '../../i18n';
import { createLogger } from '../../observability/logger';

const log = createLogger('ShareActions');

export const SHARE_IMAGE_URL = 'https://picsum.photos/seed/share/800/600.jpg';

/** Inside <cache>/clipboard/: the folder exposed by the FileProvider. */
const LOCAL_DIR = `${CachesDirectoryPath}/clipboard`;
const LOCAL_IMAGE = `${LOCAL_DIR}/picsum-share.jpg`;

let downloadRequest: Promise<string> | null = null;

/**
 * Sharing or copying an image needs a local file (apps receive a file,
 * not a web URL), so the picsum image is downloaded once to the cache.
 */
export function getLocalImage() {
  if (!downloadRequest) {
    downloadRequest = (async () => {
      if (!(await exists(LOCAL_DIR))) {
        await mkdir(LOCAL_DIR);
      }
      const { promise } = downloadFile({
        fromUrl: SHARE_IMAGE_URL,
        toFile: LOCAL_IMAGE,
      });
      const done = log.time('Image downloaded', { url: SHARE_IMAGE_URL });
      const result = await promise;
      done({ status: result.statusCode, bytes: result.bytesWritten });
      if (result.statusCode !== 200) {
        throw new Error(`Download failed (${result.statusCode})`);
      }
      return LOCAL_IMAGE;
    })().catch(error => {
      downloadRequest = null; // allow retrying
      throw error;
    });
  }
  return downloadRequest;
}

/** Text: React Native's built-in Share API opens the system share sheet. */
export async function shareText(text: string) {
  await Share.share({ message: text, title: i18n.t('share:sheet.textTitle') });
}

/**
 * Image: the built-in Share can't send files on Android, so
 * react-native-share is used. It hands the file to the target app
 * (WhatsApp, Gmail, Drive...) through its own FileProvider.
 */
export async function shareImage() {
  const path = await getLocalImage();
  try {
    await RNShare.open({
      url: `file://${path}`,
      type: 'image/jpeg',
      title: i18n.t('share:sheet.imageTitle'),
      failOnCancel: false,
    });
  } catch (error) {
    // Some Android versions report closing the share sheet as an error.
    if (!String(error).includes('User did not share')) {
      throw error;
    }
    log.debug('Share sheet closed without sharing');
  }
}

export function copyText(text: string) {
  Clipboard.setString(text);
}

export type ClipboardContent =
  | { type: 'image'; uri: string }
  | { type: 'text'; text: string }
  | { type: 'empty' };

/**
 * Reads the clipboard back. getImage returns a data: URI on both platforms
 * (on Android it reads the content:// URI that was copied), so it can be
 * shown directly in an <Image>.
 */
export async function readClipboard(): Promise<ClipboardContent> {
  try {
    const image = await Clipboard.getImage();
    if (image) {
      const uri = image.startsWith('data:')
        ? image
        : `data:image/png;base64,${image}`;
      return { type: 'image', uri };
    }
  } catch {
    // No image on the clipboard (or not supported): fall back to text.
  }
  const text = await Clipboard.getString();
  return text ? { type: 'text', text } : { type: 'empty' };
}

type ImageClipboardModule = { copyImage(path: string): Promise<string> };

/**
 * Image to clipboard:
 * - iOS: @react-native-clipboard/clipboard's setImage (takes base64).
 * - Android: that library doesn't support images, so the app's own native
 *   module (android/.../clipboard/ImageClipboardModule.kt) is used.
 */
export async function copyImage() {
  const path = await getLocalImage();
  if (Platform.OS === 'android') {
    const module = NativeModules.ImageClipboard as
      | ImageClipboardModule
      | undefined;
    if (!module) {
      log.warn('ImageClipboard native module is missing', {
        modules: Object.keys(NativeModules).length,
      });
      throw new Error('ImageClipboard native module missing: rebuild the app');
    }
    // Note: on the Android emulator, "clipboard sharing" with the computer
    // only syncs text and immediately replaces an image clip with empty
    // text. On real devices the image stays on the clipboard.
    await module.copyImage(path);
  } else {
    const base64 = await readFile(path, 'base64');
    Clipboard.setImage(base64);
  }
}

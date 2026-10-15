/**
 * In-memory stand-in for @dr.pogodin/react-native-fs (a native module).
 * Files are just keys in a Set; copyFile/exists/mkdir/unlink behave like
 * the real API for the paths used by the photo gallery.
 */
const files = new Set();
const dirs = new Set();

module.exports = {
  DocumentDirectoryPath: '/documents',
  CachesDirectoryPath: '/cache',
  downloadFile({ toFile }) {
    files.add(toFile);
    return { promise: Promise.resolve({ statusCode: 200 }) };
  },
  async readFile() {
    return '';
  },
  async exists(path) {
    return files.has(path) || dirs.has(path);
  },
  async mkdir(path) {
    dirs.add(path);
  },
  async copyFile(_from, to) {
    files.add(to);
  },
  async unlink(path) {
    files.delete(path);
  },
  // Test helpers
  __files: files,
  __reset() {
    files.clear();
    dirs.clear();
  },
};

import { hmac } from '@noble/hashes/hmac.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';

export const PIN_LENGTH = 6;

/**
 * The PIN itself is never stored: only HMAC-SHA256(salt, PIN).
 *
 * Why not a slow KDF like PBKDF2? In pure JavaScript (Hermes) 10,000
 * iterations took ~19 s per check, and with only 1,000,000 possible 6-digit
 * PINs extra iterations barely slow down a brute force anyway. The real
 * protection is elsewhere:
 * - the hash is stored encrypted by the iOS Keychain / Android Keystore
 *   (hardware backed), so it can't be read off the device;
 * - in the app, 5 wrong PINs block entry for 1 minute.
 */
export type PinHash = { salt: string; hash: string };

export function isValidPin(pin: string) {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);
}

/**
 * Salt only needs to be unique, not secret. Hermes has no
 * crypto.getRandomValues, so it's built from time + Math.random.
 */
function newSalt() {
  return `${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2)}${Math.random().toString(36).slice(2)}`;
}

function derive(pin: string, salt: string) {
  return bytesToHex(hmac(sha256, utf8ToBytes(salt), utf8ToBytes(pin)));
}

export async function hashPin(pin: string): Promise<PinHash> {
  const salt = newSalt();
  return { salt, hash: derive(pin, salt) };
}

export async function verifyPin(pin: string, stored: PinHash) {
  const hash = derive(pin, stored.salt);
  // Constant-time comparison: don't leak how many characters matched.
  /* eslint-disable no-bitwise -- XOR/OR are the point of this comparison */
  let diff = hash.length ^ stored.hash.length;
  for (let i = 0; i < hash.length && i < stored.hash.length; i++) {
    diff |= hash.charCodeAt(i) ^ stored.hash.charCodeAt(i);
  }
  /* eslint-enable no-bitwise */
  return diff === 0;
}

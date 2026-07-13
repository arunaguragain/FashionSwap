import crypto from 'crypto';

// Set a test encryption key before importing the module
const TEST_KEY = crypto.randomBytes(32).toString('hex');
process.env.ENCRYPTION_KEY = TEST_KEY;

// Must import AFTER setting the env var since the module throws on missing key
const { encrypt, decrypt, generateEncryptionKey } = require('../../../utils/encryption');

describe('Encryption utilities (AES-256-GCM)', () => {
  test('encrypt and decrypt round-trip produces original plaintext', () => {
    const plaintext = 'hello-fashionswap-secret-data';
    const ciphertext = encrypt(plaintext);
    expect(decrypt(ciphertext)).toBe(plaintext);
  });

  test('encrypted output has iv:tag:ciphertext format', () => {
    const ciphertext = encrypt('test');
    const parts = ciphertext.split(':');
    expect(parts).toHaveLength(3);
    // IV = 12 bytes = 24 hex chars
    expect(parts[0]).toHaveLength(24);
    // Auth tag = 16 bytes = 32 hex chars
    expect(parts[1]).toHaveLength(32);
    // Ciphertext is non-empty
    expect(parts[2].length).toBeGreaterThan(0);
  });

  test('encrypting the same plaintext twice produces different ciphertexts (random IV)', () => {
    const a = encrypt('same-input');
    const b = encrypt('same-input');
    expect(a).not.toBe(b);
  });

  test('tampered ciphertext fails decryption (GCM authentication)', () => {
    const ciphertext = encrypt('sensitive-data');
    const [iv, tag, data] = ciphertext.split(':');

    // Flip a character in the encrypted data
    const tampered = data[0] === 'a' ? 'b' + data.slice(1) : 'a' + data.slice(1);
    const tamperedCiphertext = `${iv}:${tag}:${tampered}`;

    expect(() => decrypt(tamperedCiphertext)).toThrow('Decryption failed');
  });

  test('tampered auth tag fails decryption', () => {
    const ciphertext = encrypt('sensitive-data');
    const [iv, tag, data] = ciphertext.split(':');

    // Flip a character in the auth tag
    const tamperedTag = tag[0] === 'a' ? 'b' + tag.slice(1) : 'a' + tag.slice(1);
    const tamperedCiphertext = `${iv}:${tamperedTag}:${data}`;

    expect(() => decrypt(tamperedCiphertext)).toThrow('Decryption failed');
  });

  test('generateEncryptionKey returns a 64-char hex string (32 bytes)', () => {
    const key = generateEncryptionKey();
    expect(key).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(key)).toBe(true);
  });
});

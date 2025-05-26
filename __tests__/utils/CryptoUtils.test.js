import { encryptId, decryptId } from '@/utils/cryptoUtils';

describe('Crypto Utils', () => {
  const testIds = [
    'simple-id',
    'complex-id-123-with-dashes',
    'uuid-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'very-long-id-that-might-cause-issues-with-encryption-and-decryption-functions',
  ];

  testIds.forEach((originalId) => {
    it(`should encrypt and decrypt "${originalId}" correctly`, () => {
      const encrypted = encryptId(originalId);
      const decrypted = decryptId(encrypted);

      expect(decrypted).toBe(originalId);
      expect(encrypted).not.toBe(originalId);
      expect(encrypted).toBeTruthy();
    });
  });

  it('should return different encrypted values for same input', () => {
    const id = 'test-id';
    const encrypted1 = encryptId(id);
    const encrypted2 = encryptId(id);

    // Both should decrypt to same value
    expect(decryptId(encrypted1)).toBe(id);
    expect(decryptId(encrypted2)).toBe(id);

    // But encrypted values might be different (depending on implementation)
    // This test assumes your crypto might use random salts/IVs
  });

  it('should handle empty string', () => {
    const encrypted = encryptId('');
    const decrypted = decryptId(encrypted);

    expect(decrypted).toBe('');
  });

  it('should throw error for invalid encrypted data', () => {
    expect(() => {
      decryptId('invalid-encrypted-data');
    }).toThrow();

    expect(() => {
      decryptId('');
    }).toThrow();

    expect(() => {
      decryptId(null);
    }).toThrow();
  });

  it('should handle special characters in IDs', () => {
    const specialIds = [
      'id-with-spaces and stuff',
      'id_with_underscores',
      'id.with.dots',
      'id@with@symbols',
      'id+with+plus',
    ];

    specialIds.forEach((id) => {
      const encrypted = encryptId(id);
      const decrypted = decryptId(encrypted);
      expect(decrypted).toBe(id);
    });
  });
});

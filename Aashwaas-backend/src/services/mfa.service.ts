import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { encrypt, decrypt } from '../utils/encryption';

export class MFAService {
  async generateTOTPSecret(userEmail: string): Promise<{ secret: string; qrCode: string }> {
    const secret = speakeasy.generateSecret({
      name: `FashionSwap (${userEmail})`,
      issuer: 'FashionSwap',
      length: 32,
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  verifyTOTP(secret: string, token: string): boolean {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2,
      });
    } catch (error) {
      console.error('TOTP verification error:', error);
      return false;
    }
  }

  async enableMFA(secret: string): Promise<string> {
    const encryptedSecret = encrypt(secret);
    return encryptedSecret;
  }

  decryptTOTPSecret(encryptedSecret: string): string {
    return decrypt(encryptedSecret);
  }
}

export const mfaService = new MFAService();

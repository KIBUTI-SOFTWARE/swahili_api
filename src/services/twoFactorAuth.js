const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class TwoFactorAuthService {
  generateSecret(username) {
    const secret = speakeasy.generateSecret({
      name: `SwahiliAPI:${username}`
    });

    return {
      ascii: secret.ascii,
      hex: secret.hex,
      base32: secret.base32,
      otpauth_url: secret.otpauth_url
    };
  }

  async generateQRCode(otpauth_url) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(otpauth_url);
      return qrCodeDataUrl;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  verifyToken(token, secret) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1 // Allow 30 seconds clock skew
    });
  }
}

module.exports = new TwoFactorAuthService();
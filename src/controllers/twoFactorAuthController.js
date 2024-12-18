const TwoFactorAuthService = require('../services/twoFactorAuth');
const { User } = require('../models/User');

exports.verify2FA = async (req, res) => {
  try {
    const { code } = req.body; // Changed from token to code
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        errors: ['User not found'],
        data: null
      });
    }

    const isValid = TwoFactorAuthService.verifyToken(
      code,
      user.securitySettings.twoFactorSecret
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        errors: ['Invalid 2FA code'],
        data: null
      });
    }

    user.securitySettings.twoFactorEnabled = true;
    await user.save();

    res.json({
      success: true,
      errors: [],
      data: {
        message: '2FA enabled successfully'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: [error.message],
      data: null
    });
  }
};
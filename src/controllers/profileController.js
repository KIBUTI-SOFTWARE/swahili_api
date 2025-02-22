const { User } = require('../models/User');

exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    
    // Handle basic profile fields
    if (req.body.firstName) updates['profile.firstName'] = req.body.firstName;
    if (req.body.lastName) updates['profile.lastName'] = req.body.lastName;
    if (req.body.phoneNumber) updates['profile.phoneNumber'] = req.body.phoneNumber;
    if (req.body.dateOfBirth) updates['profile.dateOfBirth'] = req.body.dateOfBirth;
    if (req.body.gender) updates['profile.gender'] = req.body.gender;
    if (req.body.language) updates['profile.language'] = req.body.language;
    if (req.body.timezone) updates['profile.timezone'] = req.body.timezone;
    
    // Handle avatar URL from previous upload
    if (req.body.avatar) updates['profile.avatar'] = req.body.avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -securitySettings.twoFactorSecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        errors: ['User not found'],
        data: null
      });
    }

    res.json({
      success: true,
      errors: [],
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: [error.message],
      data: null
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -securitySettings.twoFactorSecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        errors: ['User not found'],
        data: null
      });
    }

    res.json({
      success: true,
      errors: [],
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: [error.message],
      data: null
    });
  }
};
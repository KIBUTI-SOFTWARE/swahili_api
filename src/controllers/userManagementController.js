const { User, Role } = require('../models/User');
const { uploadToCloudinary } = require('../config/cloudinary');

exports.getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      userType,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (userType) query.userType = userType;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User
      .find(query)
      .select('-password -securitySettings.twoFactorSecret')
      .populate('roles', 'name description')
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      errors: [],
      data: {
        users,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalRecords: total
        }
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

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

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
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: [error.message],
      data: null
    });
  }
};

exports.assignRole = async (req, res) => {
  try {
    const { roleId } = req.body;
    const user = await User.findById(req.params.id);
    const role = await Role.findById(roleId);

    if (!user || !role) {
      return res.status(404).json({
        success: false,
        errors: ['User or role not found'],
        data: null
      });
    }

    if (!user.roles.includes(roleId)) {
      user.roles.push(roleId);
      await user.save();
    }

    res.json({
      success: true,
      errors: [],
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: [error.message],
      data: null
    });
  }
};

exports.removeRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        errors: ['User not found'],
        data: null
      });
    }

    user.roles = user.roles.filter(r => r.toString() !== roleId);
    await user.save();

    res.json({
      success: true,
      errors: [],
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: [error.message],
      data: null
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    if (req.file) {
      const avatarUrl = await uploadToCloudinary(req.file, 'avatars');
      updates['profile.avatar'] = avatarUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select('-password');

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
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: [error.message],
      data: null
    });
  }
};
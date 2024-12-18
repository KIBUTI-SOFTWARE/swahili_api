const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const permissionSchema = new mongoose.Schema({
  resource: {
    type: String,
    required: true
  },
  actions: [{
    type: String,
    enum: ['create', 'read', 'update', 'delete', 'manage'],
    required: true
  }]
});

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  permissions: [permissionSchema],
  isCustom: {
    type: Boolean,
    default: false
  }
});

const userSchema = new mongoose.Schema({
  // Existing fields
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['ADMIN', 'SELLER', 'BUYER', 'MODERATOR', 'SUPPORT'],
    required: true
  },
  
  // New fields
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  customPermissions: [permissionSchema],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },
  lastLogin: Date,
  loginAttempts: {
    count: { type: Number, default: 0 },
    lastAttempt: Date,
    lockUntil: Date
  },
  securitySettings: {
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    passwordLastChanged: Date,
    requirePasswordChange: { type: Boolean, default: false }
  },
  profile: {
    firstName: String,
    lastName: String,
    phoneNumber: String,
    avatar: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: String
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  metadata: {
    lastPasswordReset: Date,
    accountCreated: {
      type: Date,
      default: Date.now
    },
    verifiedAt: Date,
    deletedAt: Date
  }
}, {
  timestamps: true
});

// Create Role model
const Role = mongoose.model('Role', roleSchema);

// Add methods to user schema
userSchema.methods.hasPermission = function(resource, action) {
  // Check custom permissions
  const customPermission = this.customPermissions.find(p => p.resource === resource);
  if (customPermission && customPermission.actions.includes(action)) {
    return true;
  }

  // Check role-based permissions
  return this.roles.some(role => 
    role.permissions.some(p => 
      p.resource === resource && p.actions.includes(action)
    )
  );
};

userSchema.methods.isAccountLocked = function() {
  return this.loginAttempts.lockUntil && this.loginAttempts.lockUntil > Date.now();
};

userSchema.methods.incrementLoginAttempts = async function() {
  const lockTime = 30 * 60 * 1000; // 30 minutes
  const maxAttempts = 5;

  this.loginAttempts.count += 1;
  this.loginAttempts.lastAttempt = new Date();

  if (this.loginAttempts.count >= maxAttempts) {
    this.loginAttempts.lockUntil = new Date(Date.now() + lockTime);
  }

  await this.save();
};

userSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts = {
    count: 0,
    lastAttempt: null,
    lockUntil: null
  };
  await this.save();
};

// Add default roles
const defaultRoles = [
  {
    name: 'admin',
    description: 'System administrator',
    permissions: [
      { resource: '*', actions: ['manage'] }
    ]
  },
  {
    name: 'seller',
    description: 'Shop owner',
    permissions: [
      { resource: 'products', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'shops', actions: ['read', 'update'] },
      { resource: 'orders', actions: ['read', 'update'] }
    ]
  },
  {
    name: 'buyer',
    description: 'Regular customer',
    permissions: [
      { resource: 'products', actions: ['read'] },
      { resource: 'orders', actions: ['create', 'read'] },
      { resource: 'reviews', actions: ['create', 'read', 'update', 'delete'] }
    ]
  },
  {
    name: 'moderator',
    description: 'Content moderator',
    permissions: [
      { resource: 'products', actions: ['read', 'update'] },
      { resource: 'reviews', actions: ['read', 'update', 'delete'] },
      { resource: 'users', actions: ['read'] }
    ]
  }
];

// Initialize roles if they don't exist
const initializeRoles = async () => {
  try {
    for (const role of defaultRoles) {
      await Role.findOneAndUpdate(
        { name: role.name },
        { ...role, isCustom: false },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('Error initializing roles:', error);
  }
};

// Call after connection is established
mongoose.connection.once('open', () => {
  initializeRoles();
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Role
};
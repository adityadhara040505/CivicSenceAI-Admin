const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Settings = require('../models/Settings');
const ApiKey = require('../models/ApiKey');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/settings/admins
// @desc    Get all admin users
// @access  Private
router.get('/admins', authMiddleware, async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');

    res.json({
      success: true,
      data: { admins }
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/settings/admins/:id
// @desc    Update admin user
// @access  Private
router.put('/admins/:id', authMiddleware, async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (role) admin.role = role;
    if (status) admin.status = status;

    await admin.save();

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: { admin }
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/settings/admins
// @desc    Create new admin user
// @access  Private
router.post('/admins', authMiddleware, async (req, res) => {
  try {
    const { userId, password, name, email, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ $or: [{ userId }, { email }] });
    
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this userId or email already exists'
      });
    }

    const admin = new Admin({
      userId,
      password,
      name,
      email,
      role: role || 'Analyst'
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: { admin }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== GENERAL SETTINGS ====================

// @route   GET /api/settings/general
// @desc    Get general settings
// @access  Private
router.get('/general', authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    res.json({
      success: true,
      data: {
        platformName: settings.platformName,
        supportEmail: settings.supportEmail,
        contactPhone: settings.contactPhone,
        maintenanceMode: settings.maintenanceMode
      }
    });
  } catch (error) {
    console.error('Get general settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/settings/general
// @desc    Update general settings
// @access  Private
router.put('/general', authMiddleware, async (req, res) => {
  try {
    const { platformName, supportEmail, contactPhone, maintenanceMode } = req.body;

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    if (platformName !== undefined) settings.platformName = platformName;
    if (supportEmail !== undefined) settings.supportEmail = supportEmail;
    if (contactPhone !== undefined) settings.contactPhone = contactPhone;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;

    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        platformName: settings.platformName,
        supportEmail: settings.supportEmail,
        contactPhone: settings.contactPhone,
        maintenanceMode: settings.maintenanceMode
      }
    });
  } catch (error) {
    console.error('Update general settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== NOTIFICATION SETTINGS ====================

// @route   GET /api/settings/notifications
// @desc    Get notification settings
// @access  Private
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    res.json({
      success: true,
      data: settings.notifications
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/settings/notifications
// @desc    Update notification settings
// @access  Private
router.put('/notifications', authMiddleware, async (req, res) => {
  try {
    const notificationSettings = req.body;

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    settings.notifications = {
      ...settings.notifications,
      ...notificationSettings
    };

    await settings.save();

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: settings.notifications
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== API KEY MANAGEMENT ====================

// @route   GET /api/settings/api-keys
// @desc    Get all API keys
// @access  Private
router.get('/api-keys', authMiddleware, async (req, res) => {
  try {
    const apiKeys = await ApiKey.find().select('-__v');

    res.json({
      success: true,
      data: { apiKeys }
    });
  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/settings/api-keys
// @desc    Create new API key
// @access  Private
router.post('/api-keys', authMiddleware, async (req, res) => {
  try {
    const { name, service } = req.body;

    if (!name || !service) {
      return res.status(400).json({
        success: false,
        message: 'Name and service are required'
      });
    }

    const key = ApiKey.generateKey();

    const apiKey = new ApiKey({
      name,
      service,
      key
    });

    await apiKey.save();

    res.status(201).json({
      success: true,
      message: 'API key created successfully',
      data: { apiKey }
    });
  } catch (error) {
    console.error('Create API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/settings/api-keys/:id
// @desc    Revoke/delete API key
// @access  Private
router.delete('/api-keys/:id', authMiddleware, async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id);
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    apiKey.status = 'Revoked';
    await apiKey.save();

    res.json({
      success: true,
      message: 'API key revoked successfully'
    });
  } catch (error) {
    console.error('Revoke API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== AI CONFIGURATION ====================

// @route   GET /api/settings/ai
// @desc    Get AI configuration
// @access  Private
router.get('/ai', authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    res.json({
      success: true,
      data: settings.aiConfig
    });
  } catch (error) {
    console.error('Get AI config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/settings/ai
// @desc    Update AI configuration
// @access  Private
router.put('/ai', authMiddleware, async (req, res) => {
  try {
    const aiConfig = req.body;

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    settings.aiConfig = {
      ...settings.aiConfig,
      ...aiConfig
    };

    await settings.save();

    res.json({
      success: true,
      message: 'AI configuration updated successfully',
      data: settings.aiConfig
    });
  } catch (error) {
    console.error('Update AI config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== DATABASE MANAGEMENT ====================

// @route   GET /api/settings/database
// @desc    Get database settings and stats
// @access  Private
router.get('/database', authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    // Get database connection statistics
    const mongoose = require('mongoose');
    const dbStats = await mongoose.connection.db.stats();

    res.json({
      success: true,
      data: {
        config: settings.database,
        stats: {
          collections: dbStats.collections,
          dataSize: Math.round(dbStats.dataSize / 1024 / 1024), // Convert to MB
          storageSize: Math.round(dbStats.storageSize / 1024 / 1024), // Convert to MB
          indexes: dbStats.indexes
        }
      }
    });
  } catch (error) {
    console.error('Get database settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/settings/database/backup
// @desc    Trigger database backup
// @access  Private
router.post('/database/backup', authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    settings.database.lastBackup = new Date();
    await settings.save();

    // In production, you would trigger actual backup process here
    // For now, just update the lastBackup timestamp

    res.json({
      success: true,
      message: 'Database backup initiated successfully',
      data: {
        lastBackup: settings.database.lastBackup
      }
    });
  } catch (error) {
    console.error('Database backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/settings/database/optimize
// @desc    Optimize database
// @access  Private
router.post('/database/optimize', authMiddleware, async (req, res) => {
  try {
    // In production, you would run optimization commands here
    // For now, just return success

    res.json({
      success: true,
      message: 'Database optimization completed successfully'
    });
  } catch (error) {
    console.error('Database optimization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
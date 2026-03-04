const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // General Settings
  platformName: {
    type: String,
    default: 'CivicSense AI'
  },
  supportEmail: {
    type: String,
    default: 'support@civicsense.ai'
  },
  contactPhone: {
    type: String,
    default: '+91 1234567890'
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },

  // Notification Settings
  notifications: {
    emailPolicyUploads: {
      type: Boolean,
      default: true
    },
    emailSchemeUpdates: {
      type: Boolean,
      default: true
    },
    emailUserRegistrations: {
      type: Boolean,
      default: true
    },
    emailWeeklyReports: {
      type: Boolean,
      default: false
    },
    emailSystemAlerts: {
      type: Boolean,
      default: true
    }
  },

  // AI Configuration
  aiConfig: {
    modelProvider: {
      type: String,
      default: 'OpenAI'
    },
    modelName: {
      type: String,
      default: 'GPT-4'
    },
    temperature: {
      type: Number,
      default: 0.7
    },
    maxTokens: {
      type: Number,
      default: 2000
    }
  },

  // Database Settings
  database: {
    autoBackup: {
      type: Boolean,
      default: true
    },
    backupFrequency: {
      type: String,
      default: 'Daily'
    },
    lastBackup: {
      type: Date
    },
    dataRetention: {
      type: Number,
      default: 90
    }
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

settingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);

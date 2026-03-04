const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  service: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Revoked'],
    default: 'Active'
  },
  lastUsed: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate a secure API key
apiKeySchema.statics.generateKey = function() {
  return 'cs_' + crypto.randomBytes(32).toString('hex');
};

module.exports = mongoose.model('ApiKey', apiKeySchema);

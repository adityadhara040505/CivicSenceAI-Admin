const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  device: {
    type: String,
    enum: ['Mobile', 'Desktop', 'Tablet'],
    default: 'Mobile'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  sessionCount: {
    type: Number,
    default: 0
  },
  totalSimulations: {
    type: Number,
    default: 0
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);

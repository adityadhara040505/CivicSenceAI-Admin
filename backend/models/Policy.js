const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Budget', 'Tax', 'Agriculture', 'MSME', 'Housing', 'Education', 'Sustainability', 'Technology', 'Employment']
  },
  description: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Archived', 'Processing'],
    default: 'Processing'
  },
  views: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  processedData: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Policy', policySchema);

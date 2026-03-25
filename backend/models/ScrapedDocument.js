const mongoose = require('mongoose');

const scrapedDocumentSchema = new mongoose.Schema({
    // Core identification
    title: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    sourceUrl: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // Content
    content: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        default: ''
    },

    // Classification
    documentType: {
        type: String,
        required: true,
        enum: [
            'scheme',
            'policy',
            'amendment',
            'budget',
            'spotlight',
            'act',
            'rule',
            'notification',
            'circular',
            'guideline',
            'press_release',
            'other'
        ],
        index: true
    },
    category: {
        type: String,
        default: 'General',
        index: true
    },
    ministry: {
        type: String,
        default: ''
    },
    tags: [{
        type: String,
        trim: true
    }],

    // Scheme-specific fields
    schemeDetails: {
        benefits: { type: String, default: '' },
        eligibility: { type: String, default: '' },
        applicationProcess: { type: String, default: '' },
        documentsRequired: { type: String, default: '' },
        targetBeneficiaries: { type: String, default: '' },
        implementingAgency: { type: String, default: '' },
        schemeType: { type: String, default: '' }, // Central / State
        state: { type: String, default: '' }
    },

    // Metadata
    source: {
        type: String,
        default: 'india.gov.in',
        enum: ['india.gov.in', 'myscheme.gov.in', 'pib.gov.in', 'indiacode.nic.in', 'other']
    },
    publishedDate: {
        type: Date,
        default: null
    },
    scrapedAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },

    // Status tracking
    status: {
        type: String,
        enum: ['active', 'archived', 'draft', 'failed'],
        default: 'active'
    },
    scrapeStatus: {
        type: String,
        enum: ['pending', 'scraped', 'failed', 'updated'],
        default: 'scraped'
    },

    // For linking to Policy model (auto-created policies)
    linkedPolicyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Policy',
        default: null
    },
    linkedSchemeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scheme',
        default: null
    }
}, {
    timestamps: true
});

// Text index for search
scrapedDocumentSchema.index({
    title: 'text',
    content: 'text',
    summary: 'text',
    tags: 'text'
});

// Compound index for efficient queries
scrapedDocumentSchema.index({ documentType: 1, category: 1, scrapedAt: -1 });

module.exports = mongoose.model('ScrapedDocument', scrapedDocumentSchema);

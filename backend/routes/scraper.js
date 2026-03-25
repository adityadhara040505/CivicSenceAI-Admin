const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const ScrapedDocument = require('../models/ScrapedDocument');
const {
    runFullScrape,
    runTargetedScrape,
    getStatus
} = require('../services/scraper');

// ============================================================
// @route   POST /api/scraper/run
// @desc    Start a full web scrape (all categories)
// @access  Private (admin only)
// ============================================================
router.post('/run', authMiddleware, async (req, res) => {
    try {
        const status = getStatus();
        if (status.isRunning) {
            return res.status(409).json({
                success: false,
                message: 'A scraping session is already in progress',
                data: status
            });
        }

        // Run scraping in background (non-blocking)
        res.json({
            success: true,
            message: 'Full scraping started. Use GET /api/scraper/status to track progress.',
            data: { startedAt: new Date() }
        });

        // Start the scrape after sending response
        const result = await runFullScrape();
        console.log('📊 Full scrape result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Scraper run error:', error);
        // Response already sent, just log
    }
});

// ============================================================
// @route   POST /api/scraper/run/:type
// @desc    Run targeted scrape (schemes, spotlights, policies, press_releases)
// @access  Private
// ============================================================
router.post('/run/:type', authMiddleware, async (req, res) => {
    const { type } = req.params;
    const validTypes = ['schemes', 'spotlights', 'policies', 'press_releases'];

    if (!validTypes.includes(type)) {
        return res.status(400).json({
            success: false,
            message: `Invalid scrape type. Valid types: ${validTypes.join(', ')}`
        });
    }

    const status = getStatus();
    if (status.isRunning) {
        return res.status(409).json({
            success: false,
            message: 'A scraping session is already in progress',
            data: status
        });
    }

    res.json({
        success: true,
        message: `Scraping ${type} started. Use GET /api/scraper/status to track progress.`,
        data: { type, startedAt: new Date() }
    });

    try {
        const result = await runTargetedScrape(type);
        console.log(`📊 ${type} scrape result:`, JSON.stringify(result, null, 2));
    } catch (error) {
        console.error(`Scraper ${type} error:`, error);
    }
});

// ============================================================
// @route   GET /api/scraper/status
// @desc    Get current scraping status
// @access  Private
// ============================================================
router.get('/status', authMiddleware, async (req, res) => {
    try {
        const status = getStatus();
        const totalDocs = await ScrapedDocument.countDocuments();

        res.json({
            success: true,
            data: {
                ...status,
                totalDocumentsInDB: totalDocs
            }
        });
    } catch (error) {
        console.error('Status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================================
// @route   GET /api/scraper/documents
// @desc    Get all scraped documents (with filtering & pagination)
// @access  Private
// ============================================================
router.get('/documents', authMiddleware, async (req, res) => {
    try {
        const {
            type,           // documentType filter
            category,       // category filter
            source,         // source filter
            search,         // text search
            page = 1,
            limit = 20,
            sortBy = 'scrapedAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};

        if (type && type !== 'all') {
            query.documentType = type;
        }

        if (category && category !== 'all') {
            query.category = category;
        }

        if (source && source !== 'all') {
            query.source = source;
        }

        if (search) {
            query.$text = { $search: search };
        }

        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const documents = await ScrapedDocument.find(query)
            .sort(sortObj)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .select('-content'); // Exclude full content in list view

        const total = await ScrapedDocument.countDocuments(query);

        // Get aggregated stats
        const stats = await ScrapedDocument.aggregate([
            { $group: { _id: '$documentType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                documents,
                pagination: {
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                    currentPage: parseInt(page),
                    perPage: parseInt(limit)
                },
                stats
            }
        });
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================================
// @route   GET /api/scraper/documents/:id
// @desc    Get a single scraped document with full content
// @access  Private
// ============================================================
router.get('/documents/:id', authMiddleware, async (req, res) => {
    try {
        const document = await ScrapedDocument.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        res.json({
            success: true,
            data: { document }
        });
    } catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================================
// @route   DELETE /api/scraper/documents/:id
// @desc    Delete a scraped document
// @access  Private
// ============================================================
router.delete('/documents/:id', authMiddleware, async (req, res) => {
    try {
        const document = await ScrapedDocument.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        await document.deleteOne();

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================================
// @route   GET /api/scraper/stats
// @desc    Get scraping statistics & analytics
// @access  Private
// ============================================================
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const totalDocs = await ScrapedDocument.countDocuments();

        // Documents by type
        const byType = await ScrapedDocument.aggregate([
            { $group: { _id: '$documentType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Documents by category
        const byCategory = await ScrapedDocument.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Documents by source
        const bySource = await ScrapedDocument.aggregate([
            { $group: { _id: '$source', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Recent scrapes (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentCount = await ScrapedDocument.countDocuments({
            scrapedAt: { $gte: sevenDaysAgo }
        });

        // Latest scraped documents
        const latest = await ScrapedDocument.find()
            .sort({ scrapedAt: -1 })
            .limit(10)
            .select('title documentType category source scrapedAt sourceUrl');

        const status = getStatus();

        res.json({
            success: true,
            data: {
                totalDocuments: totalDocs,
                recentlyScraped: recentCount,
                byType,
                byCategory,
                bySource,
                latestDocuments: latest,
                scraperStatus: status
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================================
// @route   POST /api/scraper/clear
// @desc    Clear all scraped documents
// @access  Private
// ============================================================
router.post('/clear', authMiddleware, async (req, res) => {
    try {
        const { type } = req.body; // Optional: clear specific type

        if (type) {
            const result = await ScrapedDocument.deleteMany({ documentType: type });
            return res.json({
                success: true,
                message: `Cleared ${result.deletedCount} ${type} documents`
            });
        }

        const result = await ScrapedDocument.deleteMany({});
        res.json({
            success: true,
            message: `Cleared all ${result.deletedCount} scraped documents`
        });
    } catch (error) {
        console.error('Clear documents error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// @route   GET /api/reports
// @desc    Get all reports
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Mock reports data
    const reports = [
      {
        id: 1,
        title: 'Monthly User Activity Report',
        description: 'Comprehensive analysis of user engagement and activity',
        date: 'March 2026',
        size: '2.4 MB',
        type: 'PDF',
        createdAt: new Date('2026-03-01')
      },
      {
        id: 2,
        title: 'Policy Impact Analysis',
        description: 'Detailed breakdown of policy performance and reach',
        date: 'February 2026',
        size: '3.8 MB',
        type: 'PDF',
        createdAt: new Date('2026-02-01')
      },
      {
        id: 3,
        title: 'Scheme Eligibility Report',
        description: 'Statistical analysis of scheme eligibility and applications',
        date: 'February 2026',
        size: '1.9 MB',
        type: 'XLSX',
        createdAt: new Date('2026-02-15')
      },
      {
        id: 4,
        title: 'Quarterly Revenue Report',
        description: 'Financial summary and revenue projections',
        date: 'Q4 2025',
        size: '2.1 MB',
        type: 'PDF',
        createdAt: new Date('2025-12-31')
      }
    ];

    res.json({
      success: true,
      data: { reports }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

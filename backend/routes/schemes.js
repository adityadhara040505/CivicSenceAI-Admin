const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/schemes
// @desc    Get all schemes
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ eligibilityRate: -1 });

    res.json({
      success: true,
      data: { schemes }
    });
  } catch (error) {
    console.error('Get schemes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/schemes/stats
// @desc    Get scheme statistics
// @access  Private
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const totalSchemes = await Scheme.countDocuments();
    
    const avgEligibility = await Scheme.aggregate([
      { $group: { _id: null, avg: { $avg: '$eligibilityRate' } } }
    ]);

    const totalApplications = await Scheme.aggregate([
      { $group: { _id: null, total: { $sum: '$totalApplications' } } }
    ]);

    const approvedApplications = await Scheme.aggregate([
      { $group: { _id: null, total: { $sum: '$approvedApplications' } } }
    ]);

    const totalApps = totalApplications[0]?.total || 0;
    const totalApproved = approvedApplications[0]?.total || 0;
    const approvalRate = totalApps > 0 ? Math.round((totalApproved / totalApps) * 100) : 0;

    // Top performing schemes
    const topSchemes = await Scheme.find()
      .sort({ eligibilityRate: -1 })
      .limit(5);

    console.log('📊 Top Schemes fetched from database:', topSchemes.map(s => ({ name: s.name, eligibilityRate: s.eligibilityRate, totalApplications: s.totalApplications })));

    // Schemes by category
    const schemesByCategory = await Scheme.aggregate([
      { $group: { _id: '$category', schemes: { $sum: 1 }, users: { $sum: '$totalApplications' } } },
      { $project: { category: '$_id', schemes: 1, users: 1, _id: 0 } },
      { $sort: { schemes: -1 } }
    ]);

    // Get all schemes to calculate average benefit
    const allSchemes = await Scheme.find();
    let avgBenefitValue = '₹0';
    if (allSchemes.length > 0) {
      const firstSchemeBenefit = allSchemes[0].avgBenefit || '₹0';
      avgBenefitValue = firstSchemeBenefit;
    }

    res.json({
      success: true,
      data: {
        totalSchemes,
        avgEligibility: Math.round(avgEligibility[0]?.avg || 0),
        totalApplications: totalApps,
        approvedApplications: totalApproved,
        approvalRate,
        avgBenefit: avgBenefitValue,
        topSchemes,
        schemesByCategory
      }
    });
  } catch (error) {
    console.error('Get scheme stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/schemes
// @desc    Create new scheme
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const scheme = new Scheme(req.body);
    await scheme.save();

    res.status(201).json({
      success: true,
      message: 'Scheme created successfully',
      data: { scheme }
    });
  } catch (error) {
    console.error('Create scheme error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

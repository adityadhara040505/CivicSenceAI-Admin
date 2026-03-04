const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Policy = require('../models/Policy');
const Scheme = require('../models/Scheme');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    // Total policies
    const totalPolicies = await Policy.countDocuments();
    
    // Total users
    const totalUsers = await User.countDocuments();
    
    // Active users today (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const activeToday = await User.countDocuments({
      lastActive: { $gte: yesterday }
    });

    // Total simulations
    const totalSimulations = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalSimulations' } } }
    ]);

    // Daily active users (last 7 days)
    const dailyActiveUsers = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await User.countDocuments({
        lastActive: { $gte: date, $lt: nextDate }
      });
      
      dailyActiveUsers.push({
        date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        users: count,
        newUsers: Math.floor(count * 0.2) // Simulated new users
      });
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalPolicies,
          totalUsers,
          activeToday,
          totalSimulations: totalSimulations[0]?.total || 0
        },
        dailyActiveUsers
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/analytics/users
// @desc    Get user analytics
// @access  Private
router.get('/users', authMiddleware, async (req, res) => {
  try {
    // Users by state
    const usersByState = await User.aggregate([
      { $group: { _id: '$state', users: { $sum: 1 } } },
      { $project: { state: '$_id', users: 1, _id: 0 } },
      { $sort: { users: -1 } },
      { $limit: 8 }
    ]);

    // Age demographics
    const ageDemographics = await User.aggregate([
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [18, 26, 36, 46, 60, 100],
          output: { value: { $sum: 1 } }
        }
      }
    ]);

    const ageLabels = ['18-25', '26-35', '36-45', '46-60', '60+'];
    const formattedAgeDemographics = ageDemographics.map((item, idx) => ({
      name: ageLabels[idx] || '60+',
      value: item.value
    }));

    // Device usage
    const deviceUsage = await User.aggregate([
      { $group: { _id: '$device', value: { $sum: 1 } } },
      { $project: { name: '$_id', value: 1, _id: 0 } }
    ]);

    res.json({
      success: true,
      data: {
        usersByState,
        ageDemographics: formattedAgeDemographics,
        deviceUsage
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

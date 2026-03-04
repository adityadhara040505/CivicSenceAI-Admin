const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, state, status } = req.query;
    
    const query = {};
    if (state) query.state = state;
    if (status) query.status = status;

    const users = await User.find(query)
      .sort({ registeredAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'Active' });
    
    // Active today (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const activeToday = await User.countDocuments({
      lastActive: { $gte: yesterday }
    });

    // Users by state
    const usersByState = await User.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Users by device
    const usersByDevice = await User.aggregate([
      { $group: { _id: '$device', count: { $sum: 1 } } }
    ]);

    // Age demographics
    const ageDemographics = await User.aggregate([
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [18, 26, 36, 46, 60, 100],
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        activeToday,
        usersByState: usersByState.map(item => ({
          state: item._id,
          users: item.count
        })),
        usersByDevice: usersByDevice.map(item => ({
          device: item._id,
          count: item.count
        })),
        ageDemographics
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

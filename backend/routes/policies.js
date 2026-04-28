const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Policy = require('../models/Policy');
const authMiddleware = require('../middleware/auth');
const pdfProcessor = require('../services/pdfProcessor');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/policies/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'policy-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// @route   GET /api/policies
// @desc    Get all policies
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 100 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const policies = await Policy.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ uploadDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Policy.countDocuments(query);

    res.json({
      success: true,
      data: {
        policies,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    console.error('Get policies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/policies
// @desc    Upload new policy
// @access  Private
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { title, category, description } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title and category are required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'PDF file is required'
      });
    }

    const policy = new Policy({
      name: title,
      title,
      category,
      description: description || '',
      fileName: req.file.originalname,
      fileSize: req.file.size,
      filePath: req.file.path,
      status: 'Active',
      uploadedBy: req.admin._id
    });

    await policy.save();

    // Trigger PDF processing in the background
    // We don't await this to keep the response fast, 
    // but the policy status is 'Processing' by default
    pdfProcessor.processPdfFile(req.file.path, title, category, {
      policyId: policy._id,
      uploadedBy: req.admin._id
    }).catch(err => {
      console.error(`Background PDF processing failed for ${policy._id}:`, err);
    });

    res.status(201).json({
      success: true,
      message: 'Policy uploaded and processing started',
      data: { policy }
    });
  } catch (error) {
    console.error('Upload policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during upload'
    });
  }
});

// @route   GET /api/policies/:id
// @desc    Get policy by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('uploadedBy', 'name email');

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Increment views
    policy.views += 1;
    await policy.save();

    res.json({
      success: true,
      data: { policy }
    });
  } catch (error) {
    console.error('Get policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/policies/:id
// @desc    Update policy
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, category, description, status } = req.body;

    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    if (title) policy.title = title;
    if (category) policy.category = category;
    if (description !== undefined) policy.description = description;
    if (status) policy.status = status;

    await policy.save();

    res.json({
      success: true,
      message: 'Policy updated successfully',
      data: { policy }
    });
  } catch (error) {
    console.error('Update policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/policies/:id
// @desc    Delete policy
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    await policy.deleteOne();

    res.json({
      success: true,
      message: 'Policy deleted successfully'
    });
  } catch (error) {
    console.error('Delete policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/policies/stats/overview
// @desc    Get policy statistics
// @access  Private
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const totalPolicies = await Policy.countDocuments();
    const activePolicies = await Policy.countDocuments({ status: 'Active' });

    const totalViews = await Policy.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalPolicies,
        activePolicies,
        totalViews: totalViews[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get policy stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/policies/:id/reprocess
// @desc    Manually trigger PDF extraction/re-processing
// @access  Private
router.post('/:id/reprocess', authMiddleware, async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Set status to processing
    policy.status = 'Processing';
    await policy.save();

    // Trigger processing (don't await if you want immediate response, but here we might want to wait if it's fast)
    // Actually, manual re-process should probably be awaited so the UI can update immediately
    try {
      const updatedPolicy = await pdfProcessor.processPdfFile(policy.filePath, policy.title, policy.category, {
        policyId: policy._id,
        uploadedBy: req.admin._id
      });

      res.json({
        success: true,
        message: 'Re-processing successful',
        data: { policy: updatedPolicy }
      });
    } catch (processErr) {
      console.error('Re-processing error:', processErr);
      policy.status = 'Active'; // Reset status if failed
      await policy.save();

      res.status(500).json({
        success: false,
        message: `Extraction failed: ${processErr.message}`
      });
    }
  } catch (error) {
    console.error('Reprocess policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during re-processing'
    });
  }
});

module.exports = router;

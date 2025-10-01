const asyncHandler = require('../middleware/asyncHandler');
const Content = require('../models/Content');

// @desc    Get all content
// @route   GET /api/content
// @access  Public
const getContent = asyncHandler(async (req, res) => {
  const {
    search,
    platform,
    category,
    featured,
    page = 1,
    limit = 10,
    sort = '-createdAt'
  } = req.query;

  // Build query
  let query = {};

  // Search in title
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  // Filter by platform
  if (platform && platform !== 'all') {
    query.platform = platform;
  }

  // Filter by category
  if (category && category !== 'all') {
    query.category = category;
  }

  // Filter by featured
  if (featured !== undefined) {
    query.featured = featured === 'true';
  }

  // Execute query with pagination
  const content = await Content.find(query)
    .populate('agent', 'name email')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Get total count for pagination
  const total = await Content.countDocuments(query);

  res.json({
    success: true,
    count: content.length,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    },
    data: content
  });
});

// @desc    Get single content
// @route   GET /api/content/:id
// @access  Public
const getSingleContent = asyncHandler(async (req, res) => {
  const content = await Content.findById(req.params.id).populate('agent', 'name email');

  if (!content) {
    return res.status(404).json({
      success: false,
      message: 'Content not found'
    });
  }

  // Increment views
  content.views += 1;
  await content.save();

  res.json({
    success: true,
    data: content
  });
});

// @desc    Create content
// @route   POST /api/content
// @access  Private
const createContent = asyncHandler(async (req, res) => {
  // Add user to req.body
  req.body.agent = req.user.id;

  const content = await Content.create(req.body);

  res.status(201).json({
    success: true,
    data: content
  });
});

// @desc    Update content
// @route   PUT /api/content/:id
// @access  Private
const updateContent = asyncHandler(async (req, res) => {
  let content = await Content.findById(req.params.id);

  if (!content) {
    return res.status(404).json({
      success: false,
      message: 'Content not found'
    });
  }

  // Make sure user is content owner or admin
  if (content.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this content'
    });
  }

  content = await Content.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    data: content
  });
});

// @desc    Delete content
// @route   DELETE /api/content/:id
// @access  Private
const deleteContent = asyncHandler(async (req, res) => {
  const content = await Content.findById(req.params.id);

  if (!content) {
    return res.status(404).json({
      success: false,
      message: 'Content not found'
    });
  }

  // Make sure user is content owner or admin
  if (content.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this content'
    });
  }

  await Content.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    data: {},
    message: 'Content deleted successfully'
  });
});

// @desc    Increment content likes
// @route   PUT /api/content/:id/like
// @access  Public
const likeContent = asyncHandler(async (req, res) => {
  const content = await Content.findById(req.params.id);

  if (!content) {
    return res.status(404).json({
      success: false,
      message: 'Content not found'
    });
  }

  content.likes += 1;
  await content.save();

  res.json({
    success: true,
    data: content,
    message: 'Content liked successfully'
  });
});

module.exports = {
  getContent,
  getSingleContent,
  createContent,
  updateContent,
  deleteContent,
  likeContent
};
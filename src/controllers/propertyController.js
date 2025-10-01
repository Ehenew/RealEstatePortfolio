const asyncHandler = require('../middleware/asyncHandler');
const Property = require('../models/property');

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
const getProperties = asyncHandler(async (req, res) => {
  const {
    search,
    type,
    status,
    featured,
    minPrice,
    maxPrice,
    bedrooms,
    page = 1,
    limit = 10,
    sort = '-createdAt'
  } = req.query;

  // Build query
  let query = {};

  // Search in title, description, location
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }

  // Filter by type
  if (type && type !== 'all') {
    query.type = type;
  }

  // Filter by status
  if (status && status !== 'all') {
    query.status = status;
  }

  // Filter by featured
  if (featured !== undefined) {
    query.featured = featured === 'true';
  }

  // Filter by bedrooms
  if (bedrooms) {
    query.bedrooms = bedrooms;
  }

  // Execute query with pagination
  const properties = await Property.find(query)
    .populate('agent', 'name email')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Get total count for pagination
  const total = await Property.countDocuments(query);

  res.json({
    success: true,
    count: properties.length,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    },
    data: properties
  });
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
const getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate('agent', 'name email');

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  res.json({
    success: true,
    data: property
  });
});

// @desc    Create property
// @route   POST /api/properties
// @access  Private
const createProperty = asyncHandler(async (req, res) => {
  // Add user to req.body
  req.body.agent = req.user.id;

  const property = await Property.create(req.body);

  res.status(201).json({
    success: true,
    data: property
  });
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
const updateProperty = asyncHandler(async (req, res) => {
  let property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Make sure user is property owner or admin
  if (property.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this property'
    });
  }

  property = await Property.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    data: property
  });
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Make sure user is property owner or admin
  if (property.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this property'
    });
  }

  await Property.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    data: {},
    message: 'Property deleted successfully'
  });
});

// @desc    Upload property images
// @route   PUT /api/properties/:id/images
// @access  Private
const uploadPropertyImages = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Make sure user is property owner or admin
  if (property.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this property'
    });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please upload at least one image'
    });
  }

  // Process uploaded files
  const images = req.files.map(file => ({
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    isPrimary: false
  }));

  // If no primary image set, set first one as primary
  if (property.images.length === 0 && images.length > 0) {
    images[0].isPrimary = true;
  }

  // Add new images to property
  property.images.push(...images);
  await property.save();

  res.json({
    success: true,
    data: property,
    message: 'Images uploaded successfully'
  });
});

module.exports = {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages
};
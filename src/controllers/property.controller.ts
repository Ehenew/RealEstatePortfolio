import { Request, Response } from 'express';
import asyncHandler from '../middleware/asyncHandler';
import Property from '../models/property.model';
import { AuthRequest } from '../types';

/**
 * @swagger
 * components:
 *   schemas:
 *     Property:
 *       type: object
 *       required:
 *         - title
 *         - price
 *         - location
 *         - type
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: string
 *         location:
 *           type: string
 *         type:
 *           type: string
 *           enum: [villa, apartment, townhouse, penthouse, commercial, land]
 *         bedrooms:
 *           type: string
 *         bathrooms:
 *           type: string
 *         size:
 *           type: string
 *         yearBuilt:
 *           type: string
 *         parking:
 *           type: string
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *         images:
 *           type: array
 *           items:
 *             type: object
 *         featured:
 *           type: boolean
 *         status:
 *           type: string
 *           enum: [active, sold, rented, pending]
 *         agent:
 *           type: string
 *         slug:
 *           type: string
 */

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, location
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [villa, apartment, townhouse, penthouse, commercial, land]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, sold, rented, pending]
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: flat
 *         schema:
 *           type: boolean
 *         description: Return flat array instead of paginated response
 *     responses:
 *       200:
 *         description: List of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 */
export const getProperties = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    search,
    type,
    status,
    featured,
    bedrooms,
    page = 1,
    limit = 10,
    sort = '-createdAt',
    flat
  } = req.query;

  // Build query
  const query: any = {};

  // Search in title, description, location
  if (search) {
    query.$or = [
      { title: { $regex: search as string, $options: 'i' } },
      { description: { $regex: search as string, $options: 'i' } },
      { location: { $regex: search as string, $options: 'i' } }
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
    .sort(sort as string)
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  // Get total count for pagination
  const total = await Property.countDocuments(query);

  if (flat === 'true') {
    res.json(properties);
    return;
  }

  res.json({
    success: true,
    count: properties.length,
    pagination: {
      page: parseInt(page as string),
      pages: Math.ceil(total / Number(limit)),
      total
    },
    data: properties
  });
});

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get single property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Property'
 *       404:
 *         description: Property not found
 */
export const getProperty = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const property = await Property.findById(req.params.id).populate('agent', 'name email');

  if (!property) {
    res.status(404).json({
      success: false,
      message: 'Property not found'
    });
    return;
  }

  res.json({
    success: true,
    data: property
  });
});

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Property'
 *     responses:
 *       201:
 *         description: Property created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 */
export const createProperty = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  // Add user to req.body
  req.body.agent = authReq.user?._id;

  const property = await Property.create(req.body);

  res.status(201).json({
    success: true,
    data: property
  });
});

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update a property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Property'
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       403:
 *         description: Not authorized to update this property
 *       404:
 *         description: Property not found
 */
export const updateProperty = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  let property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404).json({
      success: false,
      message: 'Property not found'
    });
    return;
  }

  // Make sure user is property owner or admin
  if (property.agent.toString() !== authReq.user?._id.toString() && authReq.user?.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to update this property'
    });
    return;
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

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete a property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       403:
 *         description: Not authorized to delete this property
 *       404:
 *         description: Property not found
 */
export const deleteProperty = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404).json({
      success: false,
      message: 'Property not found'
    });
    return;
  }

  // Make sure user is property owner or admin
  if (property.agent.toString() !== authReq.user?._id.toString() && authReq.user?.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to delete this property'
    });
    return;
  }

  await Property.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    data: {},
    message: 'Property deleted successfully'
  });
});

/**
 * @swagger
 * /api/properties/{id}/images:
 *   put:
 *     summary: Upload property images
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       400:
 *         description: No images provided
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Property not found
 */
export const uploadPropertyImages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404).json({
      success: false,
      message: 'Property not found'
    });
    return;
  }

  // Make sure user is property owner or admin
  if (property.agent.toString() !== authReq.user?._id.toString() && authReq.user?.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to update this property'
    });
    return;
  }

  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Please upload at least one image'
    });
    return;
  }

  // Process uploaded files
  const images = files.map(file => ({
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


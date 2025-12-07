import { Request, Response } from 'express';
import asyncHandler from '../middleware/asyncHandler';
import Content from '../models/content.model';
import { AuthRequest } from '../types';

/**
 * @swagger
 * components:
 *   schemas:
 *     Content:
 *       type: object
 *       required:
 *         - title
 *         - platform
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         platform:
 *           type: string
 *           enum: [youtube, tiktok, facebook, instagram, telegram]
 *         duration:
 *           type: string
 *         url:
 *           type: string
 *         thumbnail:
 *           type: string
 *         category:
 *           type: string
 *           enum: [market-insights, investment-tips, neighborhood-guides, home-buying, property-tours, client-testimonials]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         featured:
 *           type: boolean
 *         scheduled:
 *           type: string
 *           format: date-time
 *         views:
 *           type: integer
 *         likes:
 *           type: integer
 *         agent:
 *           type: string
 */

/**
 * @swagger
 * /api/content:
 *   get:
 *     summary: Get all content
 *     tags: [Content]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [youtube, tiktok, facebook, instagram, telegram]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: List of content
 */
export const getContent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    search,
    platform,
    category,
    featured,
    page = 1,
    limit = 10,
    sort = '-createdAt',
    flat
  } = req.query;

  // Build query
  const query: any = {};

  // Search in title
  if (search) {
    query.title = { $regex: search as string, $options: 'i' };
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
  const items = await Content.find(query)
    .populate('agent', 'name email')
    .sort(sort as string)
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  // Get total count for pagination
  const total = await Content.countDocuments(query);

  if (flat === 'true') {
    res.json(items);
    return;
  }

  res.json({
    success: true,
    count: items.length,
    pagination: {
      page: parseInt(page as string),
      pages: Math.ceil(total / Number(limit)),
      total
    },
    data: items
  });
});

/**
 * @swagger
 * /api/content/{id}:
 *   get:
 *     summary: Get single content by ID
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Content details
 *       404:
 *         description: Content not found
 */
export const getSingleContent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const content = await Content.findById(req.params.id).populate('agent', 'name email');

  if (!content) {
    res.status(404).json({
      success: false,
      message: 'Content not found'
    });
    return;
  }

  // Increment views
  content.views += 1;
  await content.save();

  res.json({
    success: true,
    data: content
  });
});

/**
 * @swagger
 * /api/content:
 *   post:
 *     summary: Create new content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Content'
 *     responses:
 *       201:
 *         description: Content created successfully
 */
export const createContent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  // Add user to req.body
  req.body.agent = authReq.user?._id;

  const content = await Content.create(req.body);

  res.status(201).json({
    success: true,
    data: content
  });
});

/**
 * @swagger
 * /api/content/{id}:
 *   put:
 *     summary: Update content
 *     tags: [Content]
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
 *             $ref: '#/components/schemas/Content'
 *     responses:
 *       200:
 *         description: Content updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Content not found
 */
export const updateContent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  let content = await Content.findById(req.params.id);

  if (!content) {
    res.status(404).json({
      success: false,
      message: 'Content not found'
    });
    return;
  }

  // Make sure user is content owner or admin
  if (content.agent.toString() !== authReq.user?._id.toString() && authReq.user?.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to update this content'
    });
    return;
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

/**
 * @swagger
 * /api/content/{id}:
 *   delete:
 *     summary: Delete content
 *     tags: [Content]
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
 *         description: Content deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Content not found
 */
export const deleteContent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const content = await Content.findById(req.params.id);

  if (!content) {
    res.status(404).json({
      success: false,
      message: 'Content not found'
    });
    return;
  }

  // Make sure user is content owner or admin
  if (content.agent.toString() !== authReq.user?._id.toString() && authReq.user?.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to delete this content'
    });
    return;
  }

  await Content.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    data: {},
    message: 'Content deleted successfully'
  });
});

/**
 * @swagger
 * /api/content/{id}/like:
 *   put:
 *     summary: Like content (increment likes)
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Content liked successfully
 *       404:
 *         description: Content not found
 */
export const likeContent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const content = await Content.findById(req.params.id);

  if (!content) {
    res.status(404).json({
      success: false,
      message: 'Content not found'
    });
    return;
  }

  content.likes += 1;
  await content.save();

  res.json({
    success: true,
    data: content,
    message: 'Content liked successfully'
  });
});


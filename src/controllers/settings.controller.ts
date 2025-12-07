import { Request, Response } from 'express';
import asyncHandler from '../middleware/asyncHandler';
import Settings from '../models/settings.model';

/**
 * @swagger
 * components:
 *   schemas:
 *     Settings:
 *       type: object
 *       required:
 *         - phone
 *         - email
 *         - office_address
 *       properties:
 *         _id:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         office_address:
 *           type: string
 *         youtube_url:
 *           type: string
 *         facebook_url:
 *           type: string
 *         instagram_url:
 *           type: string
 *         telegram_url:
 *           type: string
 *         tiktok_url:
 *           type: string
 *         whatsapp_url:
 *           type: string
 *         linkedin_url:
 *           type: string
 *         about:
 *           type: string
 *         services:
 *           type: array
 *           items:
 *             type: string
 *         languages:
 *           type: array
 *           items:
 *             type: string
 *         experience:
 *           type: string
 *         license:
 *           type: string
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get settings
 *     tags: [Settings]
 *     parameters:
 *       - in: query
 *         name: flat
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Settings data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Settings'
 */
export const getSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const settings = await Settings.getSettings();
  const { flat } = req.query;

  if (flat === 'true') {
    res.json(settings);
    return;
  }

  res.json({
    success: true,
    data: settings
  });
});

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Settings'
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       401:
 *         description: Not authorized
 *   post:
 *     summary: Create or update settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Settings'
 *     responses:
 *       200:
 *         description: Settings created or updated successfully
 *       401:
 *         description: Not authorized
 */
export const updateSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  let settings = await Settings.findOne();

  if (!settings) {
    // Create settings if they don't exist
    settings = await Settings.create(req.body);
  } else {
    settings = await Settings.findByIdAndUpdate(settings._id, req.body, {
      new: true,
      runValidators: true
    });
  }

  res.json({
    success: true,
    data: settings,
    message: 'Settings updated successfully'
  });
});


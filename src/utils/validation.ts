import { body, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Property validation
export const validatePropertyCreate: ValidationChain[] = [
  body('title')
    .notEmpty()
    .withMessage('Property title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required'),
  body('location')
    .notEmpty()
    .withMessage('Location is required'),
  body('type')
    .isIn(['villa', 'apartment', 'townhouse', 'penthouse', 'commercial', 'land'])
    .withMessage('Invalid property type')
];

export const validatePropertyUpdate: ValidationChain[] = [
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('type')
    .optional()
    .isIn(['villa', 'apartment', 'townhouse', 'penthouse', 'commercial', 'land'])
    .withMessage('Invalid property type')
];

// Content validation
export const validateContentCreate: ValidationChain[] = [
  body('title')
    .notEmpty()
    .withMessage('Content title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('platform')
    .notEmpty()
    .withMessage('Platform is required')
    .isIn(['youtube', 'tiktok', 'facebook', 'instagram', 'telegram'])
    .withMessage('Invalid platform'),
  body('url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL if specified'),
  body('category')
    .optional()
    .isIn(['market-insights', 'investment-tips', 'neighborhood-guides', 'home-buying', 'property-tours', 'client-testimonials'])
    .withMessage('Invalid category')
];

export const validateContentUpdate: ValidationChain[] = [
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('platform')
    .optional()
    .isIn(['youtube', 'tiktok', 'facebook', 'instagram', 'telegram'])
    .withMessage('Invalid platform'),
  body('url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL if specified'),
  body('category')
    .optional()
    .isIn(['market-insights', 'investment-tips', 'neighborhood-guides', 'home-buying', 'property-tours', 'client-testimonials'])
    .withMessage('Invalid category')
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  next();
};


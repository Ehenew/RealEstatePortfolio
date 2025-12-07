import express, { Router } from 'express';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages
} from '../controllers/property.controller';
import { protect, authorize } from '../middleware/auth';
import { validatePropertyCreate, validatePropertyUpdate, handleValidationErrors } from '../utils/validation';
import { upload, handleUploadError } from '../middleware/upload';

const router: Router = express.Router();

router.route('/')
  .get(getProperties)
  .post(protect, authorize('admin', 'agent'), validatePropertyCreate, handleValidationErrors, createProperty);

router.route('/:id')
  .get(getProperty)
  .put(protect, authorize('admin', 'agent'), validatePropertyUpdate, handleValidationErrors, updateProperty)
  .delete(protect, authorize('admin', 'agent'), deleteProperty);

router.route('/:id/images')
  .put(
    protect,
    authorize('admin', 'agent'),
    upload.array('images', 10),
    handleUploadError,
    uploadPropertyImages
  );

export default router;


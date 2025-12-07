import express, { Router } from 'express';
import {
  getContent,
  getSingleContent,
  createContent,
  updateContent,
  deleteContent,
  likeContent
} from '../controllers/content.controller';
import { protect, authorize } from '../middleware/auth';
import { validateContentCreate, validateContentUpdate, handleValidationErrors } from '../utils/validation';

const router: Router = express.Router();

router.route('/')
  .get(getContent)
  .post(protect, authorize('admin', 'agent'), validateContentCreate, handleValidationErrors, createContent);

router.route('/:id')
  .get(getSingleContent)
  .put(protect, authorize('admin', 'agent'), validateContentUpdate, handleValidationErrors, updateContent)
  .delete(protect, authorize('admin', 'agent'), deleteContent);

router.put('/:id/like', likeContent);

export default router;


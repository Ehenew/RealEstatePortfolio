import express, { Router } from 'express';
import {
  getSettings,
  updateSettings
} from '../controllers/settings.controller';
import { protect, authorize } from '../middleware/auth';

const router: Router = express.Router();

router.route('/')
  .get(getSettings)
  .put(protect, authorize('admin', 'agent'), updateSettings)
  .post(protect, authorize('admin', 'agent'), updateSettings);

export default router;


import express, { Router } from 'express';
import {
  register,
  login,
  getMe,
  updatePassword
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth';

const router: Router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);

export default router;


import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { AuthRequest } from '../types';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string };
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      (req as AuthRequest).user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthRequest).user;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: `User role ${user?.role || 'unknown'} is not authorized to access this route`
      });
      return;
    }
    next();
  };
};

export const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  } as jwt.SignOptions);
};


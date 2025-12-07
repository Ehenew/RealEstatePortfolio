import { Request, Response, NextFunction } from 'express';

interface CustomError {
  message: string;
  statusCode?: number;
  code?: number;
  name?: string;
  errors?: { [key: string]: { message: string } };
  stack?: string;
}

const errorHandler = (err: CustomError & Error, _req: Request, res: Response, _next: NextFunction): void => {
  let error: CustomError = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.log(err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {}).map((val: { message: string }) => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};

export default errorHandler;


import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { sendError } from '../utils/response.util';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Trim string values in body to handle whitespace issues
    const trimmedBody = Object.keys(req.body).reduce((acc, key) => {
      acc[key] = typeof req.body[key] === 'string' ? req.body[key].trim() : req.body[key];
      return acc;
    }, {} as Record<string, any>);
    
    const { error, value } = schema.validate(trimmedBody);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      sendError(res, `البيانات المدخلة غير صحيحة: ${errorMessage}. يرجى التحقق من جميع الحقول والمحاولة مرة أخرى`, 400);
      return;
    }
    
    // Update req.body with validated and trimmed values
    Object.assign(req.body, value);
    
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Trim string values in query to handle whitespace issues
    const trimmedQuery = Object.keys(req.query).reduce((acc, key) => {
      const value = req.query[key];
      acc[key] = typeof value === 'string' ? value.trim() : value;
      return acc;
    }, {} as Record<string, any>);
    
    const { error, value } = schema.validate(trimmedQuery);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      sendError(res, `معاملات البحث غير صحيحة: ${errorMessage}. يرجى التحقق من المعاملات والمحاولة مرة أخرى`, 400);
      return;
    }
    
    // Update req.query with validated and trimmed values
    Object.assign(req.query, value);
    
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Trim string parameters to handle whitespace issues
    const trimmedParams = Object.keys(req.params).reduce((acc, key) => {
      acc[key] = typeof req.params[key] === 'string' ? req.params[key].trim() : req.params[key];
      return acc;
    }, {} as Record<string, any>);
    
    const { error, value } = schema.validate(trimmedParams);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      sendError(res, `المعاملات غير صحيحة: ${errorMessage}. يرجى التحقق من المعاملات والمحاولة مرة أخرى`, 400);
      return;
    }
    
    // Update req.params with validated and trimmed values
    Object.assign(req.params, value);
    
    next();
  };
};

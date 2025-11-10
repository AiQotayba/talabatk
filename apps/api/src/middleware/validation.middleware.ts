import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { sendError } from '../utils/response.util';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      sendError(res, `Validation error: ${errorMessage}`, 400);
      return;
    }
    
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      sendError(res, `Query validation error: ${errorMessage}`, 400);
      return;
    }
    
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
      sendError(res, `Parameter validation error: ${errorMessage}`, 400);
      return;
    }
    
    // Update req.params with validated and trimmed values
    Object.assign(req.params, value);
    
    next();
  };
};

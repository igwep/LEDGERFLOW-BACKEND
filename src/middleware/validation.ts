import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError, AuthenticatedRequest } from '../types';

export const validateRequest = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate query parameters
      if (schema.query) {
        (req.query as any) = schema.query.parse(req.query);
      }

      // Validate route parameters
      if (schema.params) {
        (req.params as any) = schema.params.parse(req.params);
      }

      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        next(new ValidationError('Validation failed', validationErrors));
      } else {
        next(error);
      }
    }
  };
};

export const validateBody = (schema: ZodSchema) => validateRequest({ body: schema });
export const validateQuery = (schema: ZodSchema) => validateRequest({ query: schema });
export const validateParams = (schema: ZodSchema) => validateRequest({ params: schema });

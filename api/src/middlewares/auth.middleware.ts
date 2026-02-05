import { Request, Response, NextFunction } from 'express';

/**
 * Placeholder auth middleware.
 * Replace with JWT/session validation.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // TODO: implement auth
  return next();
}

import { NextFunction, Request, Response } from "express";

// Middleware to check if the user has access to private files
export const privateAccessMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const isAuthorizedUser = req?.user && (req.user.role === 'customer' || req.user.role === 'admin');
  
    if (!isAuthorizedUser) {
      return res.status(403).json({ message: 'Access denied' });
    }
  
    next();
  };
  
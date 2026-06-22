import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthPayload, AuthRequest } from "../types";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import { isBlacklisted } from "../controllers/logout.controller";

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }
    const token = header.split(" ")[1];
    if (isBlacklisted(token)) {
      throw new UnauthorizedError("Token has been revoked");
    }
    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
    req.user = payload;
    next();
  } catch (err) {
    next(err instanceof UnauthorizedError || err instanceof jwt.JsonWebTokenError
      ? new UnauthorizedError("Invalid or expired token")
      : err);
  }
};

export const optionalAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      next();
      return;
    }
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
    req.user = payload;
  } catch {
    // ignore
  }
  next();
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      if (!roles.includes(req.user.activeRole as string)) {
        throw new ForbiddenError("Insufficient role permissions");
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = (err as any).statusCode || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
  });
};

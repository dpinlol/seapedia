import { Request } from "express";

export interface AuthPayload {
  userId: string;
  username: string;
  roles: string[];
  activeRole: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

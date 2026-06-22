import { Response } from "express";
import { AuthRequest } from "../types";

// ponytail: in-memory blacklist, upgrade to Redis if multi-instance
const blacklist = new Set<string>();

export const logout = (req: AuthRequest, res: Response) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) blacklist.add(token);
  res.json({ message: "Logged out successfully" });
};

export const isBlacklisted = (token: string): boolean => blacklist.has(token);

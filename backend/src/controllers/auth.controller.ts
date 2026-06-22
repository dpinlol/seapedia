import { Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/db";
import { env } from "../config/env";
import { AuthRequest } from "../types";
import { ValidationError, UnauthorizedError } from "../utils/errors";

const Roles = ["ADMIN", "SELLER", "BUYER", "DRIVER"] as const;

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  roles: z.array(z.enum(Roles)).min(1),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
      },
    });
    if (existing) {
      throw new ValidationError("Username or email already taken");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        roles: JSON.stringify(data.roles),
        activeRole: data.roles.includes("ADMIN") ? "ADMIN" : data.roles[0],
      },
    });

    if (data.roles.includes("BUYER")) {
      await prisma.buyerProfile.create({ data: { userId: user.id } });
    }
    if (data.roles.includes("DRIVER")) {
      await prisma.driverProfile.create({ data: { userId: user.id } });
    }

    const roles = JSON.parse(user.roles) as string[];
    const token = generateToken(user.id, user.username, roles, user.activeRole);
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { username: data.username } });
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedError("Invalid username or password");
    }

    const roles = JSON.parse(user.roles) as string[];
    const token = generateToken(user.id, user.username, roles, user.activeRole);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        store: true,
        buyerProfile: true,
        driverProfile: true,
      },
    });
    if (!user) throw new UnauthorizedError("User not found");
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const switchRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role } = z.object({ role: z.enum(Roles) }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    const userRoles = JSON.parse(user!.roles) as string[];
    if (!user || !userRoles.includes(role)) {
      throw new ValidationError("Role not available for this user");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { activeRole: role },
    });

    const token = generateToken(user.id, user.username, userRoles, role);
    res.json({ token, activeRole: role });
  } catch (err) {
    next(err);
  }
};

function generateToken(userId: string, username: string, roles: string[], activeRole: string | null) {
  return jwt.sign({ userId, username, roles, activeRole }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as any,
  } as any);
}

function sanitizeUser(user: any) {
  const { password, ...rest } = user;
  if (typeof rest.roles === "string") {
    rest.roles = JSON.parse(rest.roles);
  }
  return rest;
}

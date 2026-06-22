import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../types";
import { ValidationError, NotFoundError } from "../utils/errors";
import { sanitizeObject } from "../utils/sanitize";

const storeSchema = z.object({
  name: z.string().min(1).max(100),
});

export const createStore = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const raw = storeSchema.parse(req.body);
    const data = sanitizeObject(raw, ["name"]);
    const existing = await prisma.store.findUnique({ where: { name: data.name } });
    if (existing) throw new ValidationError("Store name already taken");

    const existingStore = await prisma.store.findUnique({
      where: { sellerId: req.user!.userId },
    });
    if (existingStore) throw new ValidationError("You already have a store");

    const store = await prisma.store.create({
      data: { name: data.name, sellerId: req.user!.userId },
    });
    res.status(201).json({ store });
  } catch (err) {
    next(err);
  }
};

export const updateStore = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = storeSchema.parse(req.body);
    const store = await prisma.store.findUnique({ where: { sellerId: req.user!.userId } });
    if (!store) throw new NotFoundError("Store");

    const nameTaken = await prisma.store.findUnique({ where: { name: data.name } });
    if (nameTaken && nameTaken.id !== store.id) {
      throw new ValidationError("Store name already taken");
    }

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: { name: data.name },
    });
    res.json({ store: updated });
  } catch (err) {
    next(err);
  }
};

export const getMyStore = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const store = await prisma.store.findUnique({
      where: { sellerId: req.user!.userId },
      include: { products: true },
    });
    if (!store) throw new NotFoundError("Store");
    res.json({ store });
  } catch (err) {
    next(err);
  }
};

export const getPublicStore = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: String(req.params.id) },
      include: { products: true, seller: { select: { username: true } } },
    });
    if (!store) throw new NotFoundError("Store");
    res.json({ store });
  } catch (err) {
    next(err);
  }
};

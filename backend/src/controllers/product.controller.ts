import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../types";
import { NotFoundError, ForbiddenError } from "../utils/errors";
import { sanitizeObject } from "../utils/sanitize";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
});

export const listProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.product.findMany({
      include: { store: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: String(req.params.id) },
      include: { store: { select: { id: true, name: true } } },
    });
    if (!product) throw new NotFoundError("Product");
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const raw = productSchema.parse(req.body);
    const data = sanitizeObject(raw, ["name", "description"]);
    const store = await prisma.store.findUnique({ where: { sellerId: req.user!.userId } });
    if (!store) throw new ForbiddenError("You must create a store first");

    const product = await prisma.product.create({
      data: { ...data, storeId: store.id },
    });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const raw = productSchema.partial().parse(req.body);
    const data = sanitizeObject(raw, ["name", "description"]);
    const product = await prisma.product.findUnique({ where: { id: String(req.params.id) } });
    if (!product) throw new NotFoundError("Product");

    const store = await prisma.store.findUnique({ where: { sellerId: req.user!.userId } });
    if (!store || product.storeId !== store.id) {
      throw new ForbiddenError("You can only update your own products");
    }

    const updated = await prisma.product.update({
      where: { id: String(req.params.id) },
      data,
    });
    res.json({ product: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: String(req.params.id) } });
    if (!product) throw new NotFoundError("Product");

    const store = await prisma.store.findUnique({ where: { sellerId: req.user!.userId } });
    if (!store || product.storeId !== store.id) {
      throw new ForbiddenError("You can only delete your own products");
    }

    await prisma.product.delete({ where: { id: String(req.params.id) } });
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};

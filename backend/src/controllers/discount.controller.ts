import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../types";
import { NotFoundError } from "../utils/errors";

const voucherSchema = z.object({
  code: z.string().min(3).max(20),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
  expiryDate: z.string().datetime(),
  maxUsage: z.number().int().positive(),
  minPurchase: z.number().nonnegative().default(0),
});

const promoDataSchema = z.object({
  code: z.string().min(3).max(20),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
  expiryDate: z.string().datetime(),
  minPurchase: z.number().nonnegative().default(0),
});

export const createVoucher = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = voucherSchema.parse(req.body);
    const voucher = await prisma.voucher.create({
      data: {
        ...data,
        expiryDate: new Date(data.expiryDate),
      },
    });
    res.status(201).json({ voucher });
  } catch (err) {
    next(err);
  }
};

export const listVouchers = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ vouchers });
  } catch (err) {
    next(err);
  }
};

export const getVoucher = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const voucher = await prisma.voucher.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!voucher) throw new NotFoundError("Voucher");
    res.json({ voucher });
  } catch (err) {
    next(err);
  }
};

export const createPromo = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = promoDataSchema.parse(req.body);
    const promo = await prisma.promo.create({
      data: {
        ...data,
        expiryDate: new Date(data.expiryDate),
      },
    });
    res.status(201).json({ promo });
  } catch (err) {
    next(err);
  }
};

export const listPromos = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const promos = await prisma.promo.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ promos });
  } catch (err) {
    next(err);
  }
};

export const getPromo = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const promo = await prisma.promo.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!promo) throw new NotFoundError("Promo");
    res.json({ promo });
  } catch (err) {
    next(err);
  }
};

import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../types";
import { NotFoundError } from "../utils/errors";

const addressSchema = z.object({
  label: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  phone: z.string().min(1),
  isDefault: z.boolean().optional(),
});

export const listAddresses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await prisma.buyerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) throw new NotFoundError("Buyer profile");

    const addresses = await prisma.address.findMany({
      where: { buyerId: profile.id },
      orderBy: { isDefault: "desc" },
    });
    res.json({ addresses });
  } catch (err) {
    next(err);
  }
};

export const createAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = addressSchema.parse(req.body);
    const profile = await prisma.buyerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) throw new NotFoundError("Buyer profile");

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { buyerId: profile.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: { ...data, buyerId: profile.id },
    });
    res.status(201).json({ address });
  } catch (err) {
    next(err);
  }
};

export const updateAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = addressSchema.partial().parse(req.body);
    const profile = await prisma.buyerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) throw new NotFoundError("Buyer profile");

    const existing = await prisma.address.findFirst({
      where: { id: String(req.params.id), buyerId: profile.id },
    });
    if (!existing) throw new NotFoundError("Address");

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { buyerId: profile.id },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id: String(req.params.id) },
      data,
    });
    res.json({ address: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await prisma.buyerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) throw new NotFoundError("Buyer profile");

    const existing = await prisma.address.findFirst({
      where: { id: String(req.params.id), buyerId: profile.id },
    });
    if (!existing) throw new NotFoundError("Address");

    await prisma.address.delete({ where: { id: String(req.params.id) } });
    res.json({ message: "Address deleted" });
  } catch (err) {
    next(err);
  }
};

import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../types";
import { NotFoundError } from "../utils/errors";

export const getBalance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await prisma.buyerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) throw new NotFoundError("Buyer profile");
    res.json({ balance: profile.walletBalance });
  } catch (err) {
    next(err);
  }
};

export const topUp = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount } = z.object({ amount: z.number().positive() }).parse(req.body);
    const profile = await prisma.buyerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) throw new NotFoundError("Buyer profile");

    await prisma.$transaction([
      prisma.buyerProfile.update({
        where: { userId: req.user!.userId },
        data: { walletBalance: { increment: amount } },
      }),
      prisma.walletTransaction.create({
        data: {
          buyerId: profile.id,
          amount,
          type: "TOP_UP",
          description: "Dummy top-up",
        },
      }),
    ]);

    const updated = await prisma.buyerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    res.json({ balance: updated!.walletBalance });
  } catch (err) {
    next(err);
  }
};

export const getTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await prisma.buyerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) throw new NotFoundError("Buyer profile");

    const transactions = await prisma.walletTransaction.findMany({
      where: { buyerId: profile.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
};

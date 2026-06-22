import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../types";
import { sanitizeObject } from "../utils/sanitize";

const reviewSchema = z.object({
  reviewerName: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000),
});

export const submitReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const raw = reviewSchema.parse(req.body);
    const data = sanitizeObject(raw, ["reviewerName", "comment"]);
    const review = await prisma.applicationReview.create({
      data: {
        ...data,
        userId: req.user?.userId || null,
      },
    });
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
};

export const listReviews = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviews = await prisma.applicationReview.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};

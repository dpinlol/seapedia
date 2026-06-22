import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../types";
import { NotFoundError, ValidationError, ForbiddenError } from "../utils/errors";

export const getAvailableJobs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const jobs = await prisma.deliveryJob.findMany({
      where: { status: "AVAILABLE" },
      include: {
        order: {
          include: {
            store: { select: { name: true } },
            items: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    res.json({ jobs });
  } catch (err) {
    next(err);
  }
};

export const getJobDetail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const job = await prisma.deliveryJob.findUnique({
      where: { id: String(req.params.id) },
      include: {
        order: {
          include: {
            store: { select: { name: true } },
            items: true,
            statusHistory: { orderBy: { timestamp: "desc" } },
          },
        },
      },
    });
    if (!job) throw new NotFoundError("Delivery job");
    res.json({ job });
  } catch (err) {
    next(err);
  }
};

export const takeJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const job = await prisma.deliveryJob.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!job) throw new NotFoundError("Delivery job");
    if (job.status !== "AVAILABLE") throw new ValidationError("Job already taken");
    if (job.driverId) throw new ValidationError("Job already assigned");

    const profile = await prisma.driverProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) throw new NotFoundError("Driver profile");

    await prisma.$transaction([
      prisma.deliveryJob.update({
        where: { id: job.id },
        data: { status: "IN_PROGRESS", driverId: profile.id },
      }),
      prisma.order.update({
        where: { id: job.orderId },
        data: {
          status: "SEDANG_DIKIRIM",
          driverId: profile.id,
          statusHistory: {
            create: {
              status: "SEDANG_DIKIRIM",
              note: `Driver #${req.user!.username} took the delivery`,
            },
          },
        },
      }),
    ]);

    res.json({ message: "Job taken successfully" });
  } catch (err) {
    next(err);
  }
};

export const completeJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const job = await prisma.deliveryJob.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!job) throw new NotFoundError("Delivery job");
    if (job.status !== "IN_PROGRESS") throw new ValidationError("Job is not in progress");

    const profile = await prisma.driverProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile || job.driverId !== profile.id) throw new ForbiddenError("Not your job");

    await prisma.$transaction([
      prisma.deliveryJob.update({
        where: { id: job.id },
        data: { status: "COMPLETED" },
      }),
      prisma.order.update({
        where: { id: job.orderId },
        data: {
          status: "PESANAN_SELESAI",
          statusHistory: {
            create: {
              status: "PESANAN_SELESAI",
              note: `Driver #${req.user!.username} completed delivery`,
            },
          },
        },
      }),
    ]);

    res.json({ message: "Job completed successfully" });
  } catch (err) {
    next(err);
  }
};

export const getMyJobs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await prisma.driverProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) throw new NotFoundError("Driver profile");

    const jobs = await prisma.deliveryJob.findMany({
      where: { driverId: profile.id },
      include: {
        order: {
          include: {
            store: { select: { name: true } },
            items: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ jobs });
  } catch (err) {
    next(err);
  }
};

export const getEarnings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await prisma.driverProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) throw new NotFoundError("Driver profile");

    const completedJobs = await prisma.deliveryJob.findMany({
      where: { driverId: profile.id, status: "COMPLETED" },
      include: { order: { select: { deliveryFee: true } } },
    });

    const totalEarnings = completedJobs.reduce(
      (sum, job) => sum + job.order.deliveryFee,
      0
    );

    res.json({
      earnings: {
        totalJobs: completedJobs.length,
        totalEarnings,
        averagePerJob: completedJobs.length > 0
          ? totalEarnings / completedJobs.length
          : 0,
      },
      completedJobs,
    });
  } catch (err) {
    next(err);
  }
};

import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../types";

const SLA: Record<string, number> = {
  INSTANT: 1,
  NEXT_DAY: 2,
  REGULAR: 5,
};

export const getMonitoring = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const [users, stores, products, orders, vouchers, promos, deliveries] =
      await Promise.all([
        prisma.user.count(),
        prisma.store.count(),
        prisma.product.count(),
        prisma.order.count(),
        prisma.voucher.count(),
        prisma.promo.count(),
        prisma.deliveryJob.count(),
      ]);

    res.json({
      monitoring: {
        users,
        stores,
        products,
        orders,
        vouchers,
        promos,
        deliveryJobs: deliveries,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, roles: true, activeRole: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

export const getStores = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const stores = await prisma.store.findMany({
      include: { seller: { select: { username: true } }, _count: { select: { products: true, orders: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ stores });
  } catch (err) {
    next(err);
  }
};

export const getAdminProducts = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.product.findMany({
      include: { store: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

export const getAdminOrders = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        store: { select: { name: true } },
        buyer: { include: { user: { select: { username: true } } } },
        statusHistory: { orderBy: { timestamp: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

export const getAdminDeliveries = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const jobs = await prisma.deliveryJob.findMany({
      include: {
        order: { select: { id: true, deliveryMethod: true } },
        driver: { include: { user: { select: { username: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ jobs });
  } catch (err) {
    next(err);
  }
};

export const getOverdueOrders = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { key: "simulated_date" } });
    const simulatedDate = config ? new Date(config.value) : new Date();

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { status: "SEDANG_DIKEMAS" },
          { status: "MENUNGGU_PENGIRIM" },
          { status: "SEDANG_DIKIRIM" },
        ],
      },
      include: {
        items: true,
        store: { select: { name: true } },
        buyer: { include: { user: { select: { username: true } } } },
      },
      orderBy: { createdAt: "asc" },
    });

    const overdueOrders = orders
      .filter((order) => {
        const slaDays = SLA[order.deliveryMethod] || 5;
        const deadline = new Date(order.createdAt);
        deadline.setDate(deadline.getDate() + slaDays);
        return simulatedDate >= deadline;
      })
      .map((order) => ({
        ...order,
        slaDays: SLA[order.deliveryMethod] || 5,
        deadline: new Date(order.createdAt.getTime() + (SLA[order.deliveryMethod] || 5) * 86400000),
      }));

    res.json({ overdueOrders, simulatedDate: simulatedDate.toISOString() });
  } catch (err) {
    next(err);
  }
};

export const processOverdue = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { key: "simulated_date" } });
    const simulatedDate = config ? new Date(config.value) : new Date();

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { status: "SEDANG_DIKEMAS" },
          { status: "MENUNGGU_PENGIRIM" },
          { status: "SEDANG_DIKIRIM" },
        ],
      },
      include: { items: true },
    });

    let processed = 0;

    for (const order of orders) {
      const slaDays = SLA[order.deliveryMethod] || 5;
      const deadline = new Date(order.createdAt);
      deadline.setDate(deadline.getDate() + slaDays);

      if (simulatedDate >= deadline) {
        await prisma.$transaction(async (tx) => {
          // Restore stock
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }

          // Refund buyer
          const buyerProfile = await tx.buyerProfile.findUnique({ where: { id: order.buyerId } });
          if (buyerProfile) {
            await tx.buyerProfile.update({
              where: { id: order.buyerId },
              data: { walletBalance: { increment: order.finalTotal } },
            });
            await tx.walletTransaction.create({
              data: {
                buyerId: order.buyerId,
                amount: order.finalTotal,
                type: "REFUND",
                description: `Auto refund for overdue order #${order.id.slice(0, 8)}`,
              },
            });
          }

          // Update order status
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: "DIKEMBALIKAN",
              statusHistory: {
                create: {
                  status: "DIKEMBALIKAN",
                  note: `Auto return/refund due to overdue (SLA: ${slaDays} days)`,
                },
              },
            },
          });

          // Update delivery job if exists
          await tx.deliveryJob.updateMany({
            where: { orderId: order.id, status: { not: "COMPLETED" } },
            data: { status: "CANCELLED" },
          });
        });

        processed++;
      }
    }

    res.json({
      message: `Processed ${processed} overdue orders`,
      processed,
      simulatedDate: simulatedDate.toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

export const simulateNextDay = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { days } = z.object({ days: z.number().int().positive().default(1) }).parse(req.body);

    const config = await prisma.systemConfig.findUnique({ where: { key: "simulated_date" } });
    const currentDate = config ? new Date(config.value) : new Date();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);

    await prisma.systemConfig.upsert({
      where: { key: "simulated_date" },
      update: { value: newDate.toISOString() },
      create: { key: "simulated_date", value: newDate.toISOString() },
    });

    res.json({
      message: `Simulated ${days} day(s) forward`,
      previousDate: currentDate.toISOString(),
      currentDate: newDate.toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

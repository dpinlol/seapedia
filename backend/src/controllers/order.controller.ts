import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../types";
import { NotFoundError, ValidationError, ForbiddenError } from "../utils/errors";

const OrderStatuses = ["SEDANG_DIKEMAS", "MENUNGGU_PENGIRIM", "SEDANG_DIKIRIM", "PESANAN_SELESAI", "DIKEMBALIKAN"] as const;
const DeliveryMethods = ["INSTANT", "NEXT_DAY", "REGULAR"] as const;

const deliveryFees: Record<string, number> = {
  INSTANT: 25000,
  NEXT_DAY: 10000,
  REGULAR: 5000,
};

export const checkout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { deliveryMethod, addressId, voucherCode, promoCode } = z
      .object({
        deliveryMethod: z.enum(DeliveryMethods),
        addressId: z.string().optional(),
        voucherCode: z.string().optional(),
        promoCode: z.string().optional(),
      })
      .parse(req.body);

    if (!deliveryFees[deliveryMethod]) throw new ValidationError("Invalid delivery method");

    const profile = await prisma.buyerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) throw new NotFoundError("Buyer profile");

    const cart = await prisma.cart.findUnique({
      where: { buyerId: profile.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    if (!cart || cart.items.length === 0) throw new ValidationError("Cart is empty");
    if (!cart.storeId) throw new ValidationError("No store associated with cart");

    const store = await prisma.store.findUnique({ where: { id: cart.storeId } });
    if (!store) throw new NotFoundError("Store");

    let subtotal = 0;
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        throw new ValidationError(`Insufficient stock for ${item.product.name}`);
      }
      subtotal += item.product.price * item.quantity;
    }

    // Discount calculation
    let discountAmount = 0;
    let voucherId: string | undefined;
    let promoId: string | undefined;

    if (voucherCode) {
      const voucher = await prisma.voucher.findUnique({ where: { code: voucherCode } });
      if (!voucher || voucher.expiryDate < new Date() || voucher.currentUsage >= voucher.maxUsage) {
        throw new ValidationError("Invalid or expired voucher");
      }
      if (subtotal < voucher.minPurchase) throw new ValidationError("Minimum purchase not met for voucher");

      discountAmount += voucher.discountType === "PERCENTAGE"
        ? (subtotal * voucher.discountValue) / 100
        : voucher.discountValue;
      voucherId = voucher.id;
    }

    if (promoCode) {
      const promo = await prisma.promo.findUnique({ where: { code: promoCode } });
      if (!promo || promo.expiryDate < new Date()) {
        throw new ValidationError("Invalid or expired promo");
      }
      if (subtotal < promo.minPurchase) throw new ValidationError("Minimum purchase not met for promo");

      discountAmount += promo.discountType === "PERCENTAGE"
        ? (subtotal * promo.discountValue) / 100
        : promo.discountValue;
      promoId = promo.id;
    }

    const deliveryFee = deliveryFees[deliveryMethod];
    const ppn = (subtotal - discountAmount) * 0.12;
    const finalTotal = subtotal - discountAmount + deliveryFee + ppn;

    if (profile.walletBalance < finalTotal) {
      throw new ValidationError("Insufficient wallet balance");
    }

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const newOrder = await tx.order.create({
        data: {
          buyerId: profile.id,
          sellerId: store.sellerId,
          storeId: cart.storeId,
          subtotal,
          discountAmount,
          deliveryFee,
          ppn,
          finalTotal,
          deliveryMethod,
          status: "SEDANG_DIKEMAS",
          voucherId,
          promoId,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
            })),
          },
          statusHistory: {
            create: {
              status: "SEDANG_DIKEMAS",
              note: "Order created",
            },
          },
        },
      });

      await tx.buyerProfile.update({
        where: { id: profile.id },
        data: { walletBalance: { decrement: finalTotal } },
      });

      await tx.walletTransaction.create({
        data: {
          buyerId: profile.id,
          amount: -finalTotal,
          type: "PURCHASE",
          description: `Order #${newOrder.id.slice(0, 8)}`,
        },
      });

      // Create delivery job
      await tx.deliveryJob.create({
        data: { orderId: newOrder.id },
      });

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({ where: { id: cart.id }, data: { storeId: "" } });

      // Increment voucher usage
      if (voucherId) {
        await tx.voucher.update({
          where: { id: voucherId },
          data: { currentUsage: { increment: 1 } },
        });
      }

      return newOrder;
    });

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
};

export const getBuyerOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await prisma.buyerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) throw new NotFoundError("Buyer profile");

    const orders = await prisma.order.findMany({
      where: { buyerId: profile.id },
      include: {
        items: true,
        statusHistory: { orderBy: { timestamp: "desc" } },
        store: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

export const getSellerOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.order.findMany({
      where: { sellerId: req.user!.userId },
      include: {
        items: true,
        statusHistory: { orderBy: { timestamp: "desc" } },
        buyer: { include: { user: { select: { username: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

export const getOrderDetail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: String(req.params.id) },
      include: {
        items: true,
        statusHistory: { orderBy: { timestamp: "desc" } },
        store: { select: { name: true } },
        buyer: { include: { user: { select: { username: true } } } },
        deliveryJob: true,
      },
    });
    if (!order) throw new NotFoundError("Order");

    // Check access
    const userId = req.user!.userId;
    const isBuyer = order.buyerId === (await prisma.buyerProfile.findUnique({ where: { userId } }))?.id;
    const isSeller = order.sellerId === userId;
    const isAdmin = req.user!.activeRole === "ADMIN";
    if (!isBuyer && !isSeller && !isAdmin) {
      throw new ForbiddenError("Access denied");
    }

    res.json({ order });
  } catch (err) {
    next(err);
  }
};

export const processOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: String(req.params.id) } });
    if (!order) throw new NotFoundError("Order");
    if (order.sellerId !== req.user!.userId) throw new ForbiddenError("Not your order");
    if (order.status !== "SEDANG_DIKEMAS") {
      throw new ValidationError("Order must be in Sedang Dikemas status");
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "MENUNGGU_PENGIRIM",
        statusHistory: {
          create: {
            status: "MENUNGGU_PENGIRIM",
            note: "Seller processed the order",
          },
        },
      },
    });
    res.json({ order: updated });
  } catch (err) {
    next(err);
  }
};

export const getBuyerSpendingReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await prisma.buyerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) throw new NotFoundError("Buyer profile");

    const orders = await prisma.order.findMany({
      where: { buyerId: profile.id },
      include: {
        items: true,
        statusHistory: { orderBy: { timestamp: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalSpent = orders.reduce((sum, o) => sum + o.finalTotal, 0);
    const totalDiscounts = orders.reduce((sum, o) => sum + o.discountAmount, 0);

    res.json({
      report: {
        totalOrders: orders.length,
        totalSpent,
        totalDiscounts,
        averageOrderValue: orders.length > 0 ? totalSpent / orders.length : 0,
      },
      orders,
    });
  } catch (err) {
    next(err);
  }
};

export const getSellerIncomeReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.order.findMany({
      where: { sellerId: req.user!.userId },
      include: {
        items: true,
        statusHistory: { orderBy: { timestamp: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    const completedOrders = orders.filter((o) => o.status === "PESANAN_SELESAI");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.finalTotal, 0);
    const totalDiscountsGiven = orders.reduce((sum, o) => sum + o.discountAmount, 0);

    res.json({
      report: {
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        totalRevenue,
        totalDiscountsGiven,
        averageRevenue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
      },
      orders,
    });
  } catch (err) {
    next(err);
  }
};

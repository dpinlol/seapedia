import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../types";
import { NotFoundError, ValidationError } from "../utils/errors";

export const getCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await prisma.buyerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) throw new NotFoundError("Buyer profile");

    let cart = await prisma.cart.findUnique({
      where: { buyerId: profile.id },
      include: {
        items: {
          include: {
            product: {
              include: { store: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { buyerId: profile.id, storeId: "" },
        include: {
          items: {
            include: {
              product: {
                include: { store: { select: { id: true, name: true } } },
              },
            },
          },
        },
      });
    }

    const store = cart.storeId
      ? await prisma.store.findUnique({ where: { id: cart.storeId } })
      : null;

    res.json({ cart: { ...cart, storeName: store?.name || null } });
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, quantity } = z
      .object({ productId: z.string(), quantity: z.number().int().positive() })
      .parse(req.body);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundError("Product");
    if (product.stock < quantity) throw new ValidationError("Insufficient stock");

    const profile = await prisma.buyerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) throw new NotFoundError("Buyer profile");

    let cart = await prisma.cart.findUnique({ where: { buyerId: profile.id } });

    if (cart) {
      if (cart.storeId && cart.storeId !== product.storeId) {
        throw new ValidationError(
          "Cart already contains products from another store. Clear cart first."
        );
      }
    } else {
      cart = await prisma.cart.create({
        data: { buyerId: profile.id, storeId: product.storeId },
      });
    }

    if (!cart.storeId) {
      await prisma.cart.update({
        where: { id: cart.id },
        data: { storeId: product.storeId },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) throw new ValidationError("Insufficient stock");
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    res.json({ message: "Product added to cart" });
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { quantity } = z.object({ quantity: z.number().int().positive() }).parse(req.body);
    const profile = await prisma.buyerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) throw new NotFoundError("Buyer profile");

    const item = await prisma.cartItem.findUnique({
      where: { id: String(req.params.id) },
      include: { cart: true, product: true },
    });
    if (!item || item.cart.buyerId !== profile.id) throw new NotFoundError("Cart item");
    if (quantity > item.product.stock) throw new ValidationError("Insufficient stock");

    const updated = await prisma.cartItem.update({
      where: { id: String(req.params.id) },
      data: { quantity },
    });
    res.json({ cartItem: updated });
  } catch (err) {
    next(err);
  }
};

export const removeCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await prisma.buyerProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) throw new NotFoundError("Buyer profile");

    const item = await prisma.cartItem.findUnique({
      where: { id: String(req.params.id) },
      include: { cart: true },
    });
    if (!item || item.cart.buyerId !== profile.id) throw new NotFoundError("Cart item");

    await prisma.cartItem.delete({ where: { id: String(req.params.id) } });

    const remaining = await prisma.cartItem.count({ where: { cartId: item.cartId } });
    if (remaining === 0) {
      await prisma.cart.update({
        where: { id: item.cartId },
        data: { storeId: "" },
      });
    }

    res.json({ message: "Item removed from cart" });
  } catch (err) {
    next(err);
  }
};

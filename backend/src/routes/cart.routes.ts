/**
 * @openapi
 * tags:
 *   - name: Cart
 *     description: Buyer shopping cart with single-store enforcement
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         productId: { type: string }
 *         quantity: { type: integer, example: 2 }
 *         product:
 *           $ref: '#/components/schemas/Product'
 *     Cart:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         buyerId: { type: string }
 *         storeId: { type: string }
 *         storeName: { type: string, nullable: true }
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *     AddToCartInput:
 *       type: object
 *       required: [productId, quantity]
 *       properties:
 *         productId: { type: string }
 *         quantity: { type: integer, example: 1, minimum: 1 }
 *     UpdateCartItemInput:
 *       type: object
 *       required: [quantity]
 *       properties:
 *         quantity: { type: integer, example: 3, minimum: 1 }
 */

import { Router } from "express";
import { getCart, addToCart, updateCartItem, removeCartItem } from "../controllers/cart.controller";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();
router.use(authenticate, requireRole("BUYER"));

/**
 * @openapi
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get my cart with items
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart with items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 */
router.get("/", getCart);

/**
 * @openapi
 * /cart/add:
 *   post:
 *     tags: [Cart]
 *     summary: Add product to cart (single-store enforced)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCartInput'
 *     responses:
 *       200:
 *         description: Product added
 *       400:
 *         description: Cart from another store — clear cart first
 */
router.post("/add", addToCart);

/**
 * @openapi
 * /cart/item/{id}:
 *   put:
 *     tags: [Cart]
 *     summary: Update cart item quantity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartItemInput'
 *     responses:
 *       200:
 *         description: Quantity updated
 */
router.put("/item/:id", updateCartItem);

/**
 * @openapi
 * /cart/item/{id}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove item from cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item removed
 */
router.delete("/item/:id", removeCartItem);

export default router;

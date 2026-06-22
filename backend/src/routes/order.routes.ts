/**
 * @openapi
 * tags:
 *   - name: Orders
 *     description: Checkout, order management, and reporting
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         buyerId: { type: string }
 *         sellerId: { type: string }
 *         storeId: { type: string }
 *         subtotal: { type: number }
 *         discountAmount: { type: number }
 *         deliveryFee: { type: number }
 *         ppn: { type: number }
 *         finalTotal: { type: number }
 *         deliveryMethod: { type: string, enum: [INSTANT, NEXT_DAY, REGULAR] }
 *         status: { type: string }
 *         createdAt: { type: string, format: date-time }
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         statusHistory:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderStatusHistory'
 *     OrderItem:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         productId: { type: string }
 *         productName: { type: string }
 *         price: { type: number }
 *         quantity: { type: integer }
 *     OrderStatusHistory:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         status: { type: string }
 *         note: { type: string, nullable: true }
 *         timestamp: { type: string, format: date-time }
 *     CheckoutInput:
 *       type: object
 *       required: [deliveryMethod]
 *       properties:
 *         deliveryMethod:
 *           type: string
 *           enum: [INSTANT, NEXT_DAY, REGULAR]
 *         voucherCode: { type: string, example: DISKON10 }
 *         promoCode: { type: string, example: MERDEKA }
 *     SpendingReport:
 *       type: object
 *       properties:
 *         totalOrders: { type: integer }
 *         totalSpent: { type: number }
 *         totalDiscounts: { type: number }
 *         averageOrderValue: { type: number }
 *     IncomeReport:
 *       type: object
 *       properties:
 *         totalOrders: { type: integer }
 *         completedOrders: { type: integer }
 *         totalRevenue: { type: number }
 *         totalDiscountsGiven: { type: number }
 *         averageRevenue: { type: number }
 */

import { Router } from "express";
import {
  checkout, getBuyerOrders, getSellerOrders, getOrderDetail,
  processOrder, getBuyerSpendingReport, getSellerIncomeReport,
} from "../controllers/order.controller";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * /orders/checkout:
 *   post:
 *     tags: [Orders]
 *     summary: Checkout — create order from cart (BUYER)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutInput'
 *     responses:
 *       201:
 *         description: Order created, wallet charged
 *       400:
 *         description: Insufficient balance or validation error
 */
router.post("/checkout", requireRole("BUYER"), checkout);

/**
 * @openapi
 * /orders/buyer:
 *   get:
 *     tags: [Orders]
 *     summary: Get my order history (BUYER)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Buyer order list
 */
router.get("/buyer", requireRole("BUYER"), getBuyerOrders);

/**
 * @openapi
 * /orders/seller:
 *   get:
 *     tags: [Orders]
 *     summary: Get incoming orders (SELLER)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller order list
 */
router.get("/seller", requireRole("SELLER"), getSellerOrders);

/**
 * @openapi
 * /orders/{id}/process:
 *   post:
 *     tags: [Orders]
 *     summary: Process order — SEDANG_DIKEMAS → MENUNGGU_PENGIRIM (SELLER)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order processed
 */
router.post("/:id/process", requireRole("SELLER"), processOrder);

/**
 * @openapi
 * /orders/reports/buyer-spending:
 *   get:
 *     tags: [Orders]
 *     summary: Buyer spending report
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Spending report
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SpendingReport'
 */
router.get("/reports/buyer-spending", requireRole("BUYER"), getBuyerSpendingReport);

/**
 * @openapi
 * /orders/reports/seller-income:
 *   get:
 *     tags: [Orders]
 *     summary: Seller income report
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Income report
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IncomeReport'
 */
router.get("/reports/seller-income", requireRole("SELLER"), getSellerIncomeReport);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order detail (BUYER/SELLER/ADMIN)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order detail with items and timeline
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 */
router.get("/:id", getOrderDetail);

export default router;

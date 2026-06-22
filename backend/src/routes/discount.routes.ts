/**
 * @openapi
 * tags:
 *   - name: Discounts
 *     description: Voucher and promo code management (ADMIN)
 * components:
 *   schemas:
 *     Voucher:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         code: { type: string, example: DISKON10 }
 *         discountType: { type: string, enum: [PERCENTAGE, FIXED] }
 *         discountValue: { type: number, example: 10 }
 *         expiryDate: { type: string, format: date-time }
 *         maxUsage: { type: integer, example: 100 }
 *         currentUsage: { type: integer, example: 0 }
 *         minPurchase: { type: number, example: 50000 }
 *     VoucherInput:
 *       type: object
 *       required: [code, discountType, discountValue, expiryDate, maxUsage]
 *       properties:
 *         code: { type: string, example: DISKON10 }
 *         discountType: { type: string, enum: [PERCENTAGE, FIXED] }
 *         discountValue: { type: number, example: 10 }
 *         expiryDate: { type: string, format: date-time }
 *         maxUsage: { type: integer, example: 100 }
 *         minPurchase: { type: number, example: 0 }
 *     Promo:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         code: { type: string, example: MERDEKA }
 *         discountType: { type: string, enum: [PERCENTAGE, FIXED] }
 *         discountValue: { type: number, example: 20000 }
 *         expiryDate: { type: string, format: date-time }
 *         minPurchase: { type: number, example: 100000 }
 *     PromoInput:
 *       type: object
 *       required: [code, discountType, discountValue, expiryDate]
 *       properties:
 *         code: { type: string, example: MERDEKA }
 *         discountType: { type: string, enum: [PERCENTAGE, FIXED] }
 *         discountValue: { type: number, example: 20000 }
 *         expiryDate: { type: string, format: date-time }
 *         minPurchase: { type: number, example: 0 }
 */

import { Router } from "express";
import {
  createVoucher, listVouchers, getVoucher,
  createPromo, listPromos, getPromo,
} from "../controllers/discount.controller";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /discounts/vouchers:
 *   get:
 *     tags: [Discounts]
 *     summary: List all vouchers (ADMIN)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Voucher list
 */
router.get("/vouchers", authenticate, requireRole("ADMIN"), listVouchers);

/**
 * @openapi
 * /discounts/vouchers/{id}:
 *   get:
 *     tags: [Discounts]
 *     summary: Get voucher by ID (ADMIN)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Voucher detail
 */
router.get("/vouchers/:id", authenticate, requireRole("ADMIN"), getVoucher);

/**
 * @openapi
 * /discounts/vouchers:
 *   post:
 *     tags: [Discounts]
 *     summary: Create a voucher (ADMIN)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VoucherInput'
 *     responses:
 *       201:
 *         description: Voucher created
 */
router.post("/vouchers", authenticate, requireRole("ADMIN"), createVoucher);

/**
 * @openapi
 * /discounts/promos:
 *   get:
 *     tags: [Discounts]
 *     summary: List all promos (ADMIN)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Promo list
 */
router.get("/promos", authenticate, requireRole("ADMIN"), listPromos);

/**
 * @openapi
 * /discounts/promos/{id}:
 *   get:
 *     tags: [Discounts]
 *     summary: Get promo by ID (ADMIN)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Promo detail
 */
router.get("/promos/:id", authenticate, requireRole("ADMIN"), getPromo);

/**
 * @openapi
 * /discounts/promos:
 *   post:
 *     tags: [Discounts]
 *     summary: Create a promo (ADMIN)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PromoInput'
 *     responses:
 *       201:
 *         description: Promo created
 */
router.post("/promos", authenticate, requireRole("ADMIN"), createPromo);

export default router;

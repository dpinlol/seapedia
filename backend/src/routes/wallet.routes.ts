/**
 * @openapi
 * tags:
 *   - name: Wallet
 *     description: Buyer wallet management
 * components:
 *   schemas:
 *     WalletBalance:
 *       type: object
 *       properties:
 *         balance: { type: number, example: 500000 }
 *     TopUpInput:
 *       type: object
 *       required: [amount]
 *       properties:
 *         amount: { type: number, example: 100000 }
 *     WalletTransaction:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         amount: { type: number }
 *         type: { type: string, enum: [TOP_UP, PURCHASE] }
 *         description: { type: string }
 *         createdAt: { type: string, format: date-time }
 */

import { Router } from "express";
import { getBalance, topUp, getTransactions } from "../controllers/wallet.controller";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();
router.use(authenticate, requireRole("BUYER"));

/**
 * @openapi
 * /wallet/balance:
 *   get:
 *     tags: [Wallet]
 *     summary: Get wallet balance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current balance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WalletBalance'
 */
router.get("/balance", getBalance);

/**
 * @openapi
 * /wallet/topup:
 *   post:
 *     tags: [Wallet]
 *     summary: Top up wallet
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TopUpInput'
 *     responses:
 *       200:
 *         description: Top-up successful
 */
router.post("/topup", topUp);

/**
 * @openapi
 * /wallet/transactions:
 *   get:
 *     tags: [Wallet]
 *     summary: Get transaction history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WalletTransaction'
 */
router.get("/transactions", getTransactions);

export default router;

/**
 * @openapi
 * tags:
 *   - name: Stores
 *     description: Store management for sellers
 * components:
 *   schemas:
 *     Store:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         name: { type: string, example: Toko Serba Ada }
 *         sellerId: { type: string }
 *     StoreInput:
 *       type: object
 *       required: [name]
 *       properties:
 *         name: { type: string, example: Toko Serba Ada }
 */

import { Router } from "express";
import {
  createStore, updateStore, getMyStore, getPublicStore,
} from "../controllers/store.controller";
import { authenticate, optionalAuth, requireRole } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /stores/me:
 *   get:
 *     tags: [Stores]
 *     summary: Get my store (SELLER)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Store detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 */
router.get("/me", authenticate, requireRole("SELLER"), getMyStore);

/**
 * @openapi
 * /stores:
 *   post:
 *     tags: [Stores]
 *     summary: Create a store (SELLER)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StoreInput'
 *     responses:
 *       201:
 *         description: Store created
 */
router.post("/", authenticate, requireRole("SELLER"), createStore);

/**
 * @openapi
 * /stores:
 *   put:
 *     tags: [Stores]
 *     summary: Update store name (SELLER)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StoreInput'
 *     responses:
 *       200:
 *         description: Store updated
 */
router.put("/", authenticate, requireRole("SELLER"), updateStore);

/**
 * @openapi
 * /stores/{id}:
 *   get:
 *     tags: [Stores]
 *     summary: Get public store info
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Store info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 */
router.get("/:id", optionalAuth, getPublicStore);

export default router;

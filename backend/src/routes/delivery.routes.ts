/**
 * @openapi
 * tags:
 *   - name: Delivery
 *     description: Driver delivery job management
 * components:
 *   schemas:
 *     DeliveryJob:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         orderId: { type: string }
 *         driverId: { type: string, nullable: true }
 *         status: { type: string, enum: [AVAILABLE, IN_PROGRESS, COMPLETED] }
 *         order:
 *           type: object
 *           properties:
 *             id: { type: string }
 *             store: { $ref: '#/components/schemas/Store' }
 *             items:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderItem'
 *             deliveryMethod: { type: string }
 *             finalTotal: { type: number }
 *     Earnings:
 *       type: object
 *       properties:
 *         totalEarnings: { type: number }
 *         completedJobs: { type: integer }
 */

import { Router } from "express";
import {
  getAvailableJobs, getJobDetail, takeJob, completeJob,
  getMyJobs, getEarnings,
} from "../controllers/delivery.controller";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();
router.use(authenticate, requireRole("DRIVER"));

/**
 * @openapi
 * /delivery/available:
 *   get:
 *     tags: [Delivery]
 *     summary: Get available delivery jobs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available jobs list
 */
router.get("/available", getAvailableJobs);

/**
 * @openapi
 * /delivery/my-jobs:
 *   get:
 *     tags: [Delivery]
 *     summary: Get my delivery jobs (history)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Driver's job history
 */
router.get("/my-jobs", getMyJobs);

/**
 * @openapi
 * /delivery/earnings:
 *   get:
 *     tags: [Delivery]
 *     summary: Get driver earnings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Earnings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Earnings'
 */
router.get("/earnings", getEarnings);

/**
 * @openapi
 * /delivery/{id}:
 *   get:
 *     tags: [Delivery]
 *     summary: Get delivery job detail
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Job detail
 */
router.get("/:id", getJobDetail);

/**
 * @openapi
 * /delivery/{id}/take:
 *   post:
 *     tags: [Delivery]
 *     summary: Take / claim a delivery job
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Job claimed, order → SEDANG_DIKIRIM
 */
router.post("/:id/take", takeJob);

/**
 * @openapi
 * /delivery/{id}/complete:
 *   post:
 *     tags: [Delivery]
 *     summary: Complete a delivery job
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Job completed, order → PESANAN_SELESAI
 */
router.post("/:id/complete", completeJob);

export default router;

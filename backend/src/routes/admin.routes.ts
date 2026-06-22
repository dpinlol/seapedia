/**
 * @openapi
 * tags:
 *   - name: Admin
 *     description: Platform administration (ADMIN only)
 * components:
 *   schemas:
 *     MonitoringData:
 *       type: object
 *       properties:
 *         totalUsers: { type: integer }
 *         totalStores: { type: integer }
 *         totalProducts: { type: integer }
 *         totalOrders: { type: integer }
 *         totalRevenue: { type: number }
 *     OverdueOrder:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         status: { type: string }
 *         deliveryMethod: { type: string }
 *         createdAt: { type: string, format: date-time }
 *         store: { $ref: '#/components/schemas/Store' }
 *         finalTotal: { type: number }
 */

import { Router } from "express";
import {
  getMonitoring, getUsers, getStores, getAdminProducts, getAdminOrders,
  getAdminDeliveries, getOverdueOrders, processOverdue, simulateNextDay,
} from "../controllers/admin.controller";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();
router.use(authenticate, requireRole("ADMIN"));

/**
 * @openapi
 * /admin/monitoring:
 *   get:
 *     tags: [Admin]
 *     summary: Platform monitoring stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MonitoringData'
 */
router.get("/monitoring", getMonitoring);

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User list
 */
router.get("/users", getUsers);

/**
 * @openapi
 * /admin/stores:
 *   get:
 *     tags: [Admin]
 *     summary: List all stores
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Store list
 */
router.get("/stores", getStores);

/**
 * @openapi
 * /admin/products:
 *   get:
 *     tags: [Admin]
 *     summary: List all products (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product list
 */
router.get("/products", getAdminProducts);

/**
 * @openapi
 * /admin/orders:
 *   get:
 *     tags: [Admin]
 *     summary: List all orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order list
 */
router.get("/orders", getAdminOrders);

/**
 * @openapi
 * /admin/deliveries:
 *   get:
 *     tags: [Admin]
 *     summary: List all deliveries
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Delivery list
 */
router.get("/deliveries", getAdminDeliveries);

/**
 * @openapi
 * /admin/overdue:
 *   get:
 *     tags: [Admin]
 *     summary: Get overdue orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overdue orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OverdueOrder'
 */
router.get("/overdue", getOverdueOrders);

/**
 * @openapi
 * /admin/overdue/process:
 *   post:
 *     tags: [Admin]
 *     summary: Process overdue orders (auto-refund)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overdue orders processed
 */
router.post("/overdue/process", processOverdue);

/**
 * @openapi
 * /admin/simulate-day:
 *   post:
 *     tags: [Admin]
 *     summary: Simulate next day (advance time for SLA testing)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Day simulated
 */
router.post("/simulate-day", simulateNextDay);

export default router;

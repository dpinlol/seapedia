/**
 * @openapi
 * components:
 *   schemas:
 *     LoginInput:
 *       type: object
 *       properties:
 *         email: { type: string, example: seller@seapedia.id }
 *         password: { type: string, example: password123 }
 *     RegisterInput:
 *       type: object
 *       properties:
 *         name: { type: string, example: Budi Santoso }
 *         email: { type: string, example: buyer@seapedia.id }
 *         password: { type: string, example: password123 }
 *         phone: { type: string, example: 081234567890 }
 *         roles: { type: array, items: { type: string, enum: [BUYER, SELLER, DRIVER] }, example: [BUYER] }
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token: { type: string }
 *         user:
 *           type: object
 *           properties:
 *             id: { type: string }
 *             name: { type: string }
 *             email: { type: string }
 *             roles: { type: array, items: { type: string } }
 *             activeRole: { type: string }
 */

import { Router } from "express";
import { register, login, getProfile, switchRole } from "../controllers/auth.controller";
import { logout } from "../controllers/logout.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Validation error
 */
router.post("/register", register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and revoke token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post("/logout", authenticate, logout);

/**
 * @openapi
 * /auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get("/profile", authenticate, getProfile);

/**
 * @openapi
 * /auth/switch-role:
 *   post:
 *     tags: [Auth]
 *     summary: Switch active role for multi-role users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [BUYER, SELLER, DRIVER, ADMIN]
 *     responses:
 *       200:
 *         description: Role switched
 */
router.post("/switch-role", authenticate, switchRole);

export default router;

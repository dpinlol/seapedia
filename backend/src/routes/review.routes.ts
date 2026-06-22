/**
 * @openapi
 * tags:
 *   - name: Reviews
 *     description: Application reviews (public)
 * components:
 *   schemas:
 *     ApplicationReview:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         reviewerName: { type: string, example: Budi Santoso }
 *         rating: { type: integer, example: 5, minimum: 1, maximum: 5 }
 *         comment: { type: string, example: Aplikasi yang sangat bagus! }
 *         createdAt: { type: string, format: date-time }
 *     ReviewInput:
 *       type: object
 *       required: [reviewerName, rating, comment]
 *       properties:
 *         reviewerName: { type: string, example: Budi Santoso }
 *         rating: { type: integer, example: 5, minimum: 1, maximum: 5 }
 *         comment: { type: string, example: Aplikasi yang sangat bagus! }
 */

import { Router } from "express";
import { submitReview, listReviews } from "../controllers/review.controller";
import { optionalAuth } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: List all application reviews
 *     responses:
 *       200:
 *         description: Review list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ApplicationReview'
 */
router.get("/", listReviews);

/**
 * @openapi
 * /reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Submit an application review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *     responses:
 *       201:
 *         description: Review submitted
 */
router.post("/", optionalAuth, submitReview);

export default router;

/**
 * @openapi
 * tags:
 *   - name: Products
 *     description: Product catalog and seller product management
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         name: { type: string, example: Kaos Polos }
 *         description: { type: string }
 *         price: { type: number, example: 75000 }
 *         stock: { type: integer, example: 50 }
 *         storeId: { type: string }
 *         store:
 *           type: object
 *           properties:
 *             id: { type: string }
 *             name: { type: string }
 *     ProductInput:
 *       type: object
 *       properties:
 *         name: { type: string, example: Kaos Polos }
 *         description: { type: string, example: Kaos katun berkualitas tinggi }
 *         price: { type: number, example: 75000 }
 *         stock: { type: integer, example: 50 }
 *         storeId: { type: string }
 *   parameters:
 *     productId:
 *       name: id
 *       in: path
 *       required: true
 *       schema: { type: string }
 */

import { Router } from "express";
import {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
} from "../controllers/product.controller";
import { authenticate, optionalAuth, requireRole } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List all products
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search query (name or description)
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: inStock
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Product list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
router.get("/", optionalAuth, listProducts);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     parameters:
 *       - $ref: '#/components/parameters/productId'
 *     responses:
 *       200:
 *         description: Product detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get("/:id", optionalAuth, getProduct);

/**
 * @openapi
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create a product (SELLER)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Product created
 */
router.post("/", authenticate, requireRole("SELLER"), createProduct);

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update a product (SELLER)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/productId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Product updated
 */
router.put("/:id", authenticate, requireRole("SELLER"), updateProduct);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product (SELLER)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/productId'
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.delete("/:id", authenticate, requireRole("SELLER"), deleteProduct);

export default router;

/**
 * @openapi
 * tags:
 *   - name: Addresses
 *     description: Buyer shipping address management
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         label: { type: string, example: Rumah }
 *         address: { type: string, example: Jl. Merdeka No. 1 }
 *         city: { type: string, example: Jakarta }
 *         phone: { type: string, example: 081234567890 }
 *         isDefault: { type: boolean, default: false }
 *     AddressInput:
 *       type: object
 *       required: [label, address, city, phone]
 *       properties:
 *         label: { type: string, example: Rumah }
 *         address: { type: string, example: Jl. Merdeka No. 1 }
 *         city: { type: string, example: Jakarta }
 *         phone: { type: string, example: 081234567890 }
 *         isDefault: { type: boolean, default: false }
 */

import { Router } from "express";
import { listAddresses, createAddress, updateAddress, deleteAddress } from "../controllers/address.controller";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();
router.use(authenticate, requireRole("BUYER"));

/**
 * @openapi
 * /addresses:
 *   get:
 *     tags: [Addresses]
 *     summary: List my addresses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Address list
 */
router.get("/", listAddresses);

/**
 * @openapi
 * /addresses:
 *   post:
 *     tags: [Addresses]
 *     summary: Create a new address
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddressInput'
 *     responses:
 *       201:
 *         description: Address created
 */
router.post("/", createAddress);

/**
 * @openapi
 * /addresses/{id}:
 *   put:
 *     tags: [Addresses]
 *     summary: Update an address
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
 *             $ref: '#/components/schemas/AddressInput'
 *     responses:
 *       200:
 *         description: Address updated
 */
router.put("/:id", updateAddress);

/**
 * @openapi
 * /addresses/{id}:
 *   delete:
 *     tags: [Addresses]
 *     summary: Delete an address
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Address deleted
 */
router.delete("/:id", deleteAddress);

export default router;

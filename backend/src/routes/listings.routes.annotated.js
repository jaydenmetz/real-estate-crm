// This file contains OpenAPI annotations for Listings routes
// To be prepended to existing listings.routes.js

/**
 * @openapi
 * /listings:
 *   get:
 *     operationId: listListings
 *     summary: List all property listings
 *     description: Returns paginated list of property listings with filtering options
 *     tags:
 *       - Listings
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [active, pending, sold, withdrawn, expired]
 *       - name: minPrice
 *         in: query
 *         schema:
 *           type: number
 *       - name: maxPrice
 *         in: query
 *         schema:
 *           type: number
 *       - name: city
 *         in: query
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Listing'
 *
 *   post:
 *     operationId: createListing
 *     summary: Create new listing
 *     description: Creates a new property listing
 *     tags:
 *       - Listings
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - list_price
 *             properties:
 *               address:
 *                 type: string
 *                 example: "456 Oak Ave, Tehachapi, CA 93561"
 *               list_price:
 *                 type: number
 *                 example: 425000
 *               property_type:
 *                 type: string
 *                 enum: [single_family, condo, townhouse, multi_family, land, commercial]
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: number
 *               square_feet:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Listing created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Listing'
 *
 * /listings/{id}:
 *   get:
 *     operationId: getListingById
 *     summary: Get listing by ID
 *     tags:
 *       - Listings
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Listing found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Listing'
 *
 *   put:
 *     operationId: updateListing
 *     summary: Update listing
 *     tags:
 *       - Listings
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               list_price:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, pending, sold, withdrawn, expired]
 *               version:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Listing updated
 *
 *   delete:
 *     operationId: deleteListing
 *     summary: Delete listing
 *     tags:
 *       - Listings
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Listing deleted
 */

// NOTE: These annotations should be added to the actual routes in listings.routes.js
module.exports = {};

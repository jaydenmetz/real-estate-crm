/**
 * This file contains OpenAPI annotations for all remaining route endpoints
 * that don't have inline JSDoc annotations. Swagger-jsdoc will automatically
 * discover and include these definitions.
 *
 * @openapi
 * /listings:
 *   get:
 *     operationId: listListings
 *     summary: List all property listings
 *     description: Returns paginated list of property listings with optional filtering
 *     tags: [Listings]
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
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *   post:
 *     operationId: createListing
 *     summary: Create new listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [address, list_price]
 *             properties:
 *               address:
 *                 type: string
 *               list_price:
 *                 type: number
 *               property_type:
 *                 type: string
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: number
 *     responses:
 *       201:
 *         description: Listing created
 *
 * /listings/{id}:
 *   get:
 *     operationId: getListingById
 *     summary: Get listing by ID
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Listing found
 *   put:
 *     operationId: updateListing
 *     summary: Update listing
 *     tags: [Listings]
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
 *               version:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Listing updated
 *   delete:
 *     operationId: deleteListing
 *     summary: Delete listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Listing deleted
 *
 * /clients:
 *   get:
 *     operationId: listClients
 *     summary: List all clients
 *     description: Returns paginated list of client contacts
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - name: client_type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [buyer, seller, both]
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [active, inactive, closed]
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     operationId: createClient
 *     summary: Create new client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, client_type]
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               client_type:
 *                 type: string
 *                 enum: [buyer, seller, both]
 *     responses:
 *       201:
 *         description: Client created
 *
 * /clients/{id}:
 *   get:
 *     operationId: getClientById
 *     summary: Get client by ID
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Client found
 *   put:
 *     operationId: updateClient
 *     summary: Update client
 *     tags: [Clients]
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
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *               version:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Client updated
 *   delete:
 *     operationId: deleteClient
 *     summary: Delete client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Client deleted
 *
 * /appointments:
 *   get:
 *     operationId: listAppointments
 *     summary: List all appointments
 *     description: Returns paginated list of appointments/showings
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - name: appointment_type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [showing, inspection, signing, meeting, call, other]
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, cancelled, no_show]
 *       - name: start_date
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     operationId: createAppointment
 *     summary: Create new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, start_time, end_time]
 *             properties:
 *               title:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               appointment_type:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created
 *
 * /appointments/{id}:
 *   get:
 *     operationId: getAppointmentById
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Appointment found
 *   put:
 *     operationId: updateAppointment
 *     summary: Update appointment
 *     tags: [Appointments]
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
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *               version:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Appointment updated
 *   delete:
 *     operationId: deleteAppointment
 *     summary: Delete appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Appointment deleted
 *
 * /leads:
 *   get:
 *     operationId: listLeads
 *     summary: List all leads
 *     description: Returns paginated list of prospective client leads
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [new, contacted, qualified, unqualified, converted, lost]
 *       - name: interest_level
 *         in: query
 *         schema:
 *           type: string
 *           enum: [hot, warm, cold]
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     operationId: createLead
 *     summary: Create new lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               source:
 *                 type: string
 *               lead_type:
 *                 type: string
 *                 enum: [buyer, seller, both]
 *     responses:
 *       201:
 *         description: Lead created
 *
 * /leads/{id}:
 *   get:
 *     operationId: getLeadById
 *     summary: Get lead by ID
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Lead found
 *   put:
 *     operationId: updateLead
 *     summary: Update lead
 *     tags: [Leads]
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
 *               status:
 *                 type: string
 *               interest_level:
 *                 type: string
 *               version:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Lead updated
 *   delete:
 *     operationId: deleteLead
 *     summary: Delete lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Lead deleted
 *
 * /leads/{id}/convert:
 *   post:
 *     operationId: convertLeadToClient
 *     summary: Convert lead to client
 *     description: Converts a qualified lead into a full client record
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Lead converted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     client_id:
 *                       type: string
 *                       format: uuid
 */

module.exports = {};

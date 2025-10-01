/**
 * This file contains OpenAPI annotations for all remaining route endpoints
 * that don't have inline JSDoc annotations. Swagger-jsdoc will automatically
 * discover and include these definitions.
 *
 * @openapi
 * /auth/register:
 *   post:
 *     operationId: registerUser
 *     summary: Register new user
 *     description: Creates a new user account. Returns JWT token for immediate authentication.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *
 * /auth/login:
 *   post:
 *     operationId: loginUser
 *     summary: Login user
 *     description: Authenticate with email/password. Returns JWT access token (7 days) and refresh token in httpOnly cookie.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@jaydenmetz.com"
 *               password:
 *                 type: string
 *                 example: "AdminPassword123!"
 *     responses:
 *       200:
 *         description: Login successful
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
 *                     token:
 *                       type: string
 *                       description: JWT access token
 *                     user:
 *                       type: object
 *       401:
 *         description: Invalid credentials
 *
 * /auth/refresh:
 *   post:
 *     operationId: refreshAccessToken
 *     summary: Refresh access token
 *     description: Get new access token using refresh token from cookie. Extends session without re-login.
 *     tags: [Authentication]
 *     security: []
 *     responses:
 *       200:
 *         description: Token refreshed
 *       401:
 *         description: Invalid refresh token
 *
 * /auth/logout:
 *   post:
 *     operationId: logoutUser
 *     summary: Logout user
 *     description: Invalidates refresh token and clears cookie
 *     tags: [Authentication]
 *     security: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *
 * /auth/verify:
 *   get:
 *     operationId: verifyToken
 *     summary: Verify token validity
 *     description: Checks if JWT token is valid and returns user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Token invalid
 *
 * /auth/profile:
 *   get:
 *     operationId: getUserProfile
 *     summary: Get user profile
 *     description: Returns authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *   put:
 *     operationId: updateUserProfile
 *     summary: Update user profile
 *     description: Updates authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 * /auth/logout-all:
 *   post:
 *     operationId: logoutAllDevices
 *     summary: Logout from all devices
 *     description: Invalidates all refresh tokens for the authenticated user, logging them out from all sessions
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices successfully
 *       401:
 *         description: Unauthorized
 *
 * /auth/sessions:
 *   get:
 *     operationId: listActiveSessions
 *     summary: List active sessions
 *     description: Returns list of active refresh tokens/sessions for authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       device_info:
 *                         type: object
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       expires_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *
 * /api-keys:
 *   get:
 *     operationId: listApiKeys
 *     summary: List API keys
 *     description: Returns list of API keys for authenticated user (keys are masked)
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API keys retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       key_preview:
 *                         type: string
 *                         description: Last 8 characters of key
 *                       is_active:
 *                         type: boolean
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       last_used_at:
 *                         type: string
 *                         format: date-time
 *                       expires_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *   post:
 *     operationId: createApiKey
 *     summary: Create new API key
 *     description: Generates a new API key for authenticated user. Key is only shown once.
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
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
 *                 description: Descriptive name for the API key
 *               expiresInDays:
 *                 type: integer
 *                 description: Number of days until expiration (default 365)
 *     responses:
 *       201:
 *         description: API key created successfully
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     key:
 *                       type: string
 *                       description: Full API key (only shown once)
 *                     name:
 *                       type: string
 *                     expires_at:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 * /api-keys/{id}/revoke:
 *   put:
 *     operationId: revokeApiKey
 *     summary: Revoke API key
 *     description: Deactivates an API key without deleting it
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: API key revoked successfully
 *       404:
 *         description: API key not found
 *       401:
 *         description: Unauthorized
 *
 * /api-keys/{id}:
 *   delete:
 *     operationId: deleteApiKey
 *     summary: Delete API key
 *     description: Permanently deletes an API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: API key deleted successfully
 *       404:
 *         description: API key not found
 *       401:
 *         description: Unauthorized
 *
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

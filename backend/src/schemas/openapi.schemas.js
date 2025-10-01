/**
 * @openapi
 * components:
 *   schemas:
 *     # ============================================
 *     # CORE MODELS
 *     # ============================================
 *
 *     Escrow:
 *       type: object
 *       description: Real estate transaction (escrow) record
 *       required:
 *         - property_address
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: Owner/agent ID
 *         property_address:
 *           type: string
 *           description: Full property address
 *           example: "123 Main St, Tehachapi, CA 93561"
 *         city:
 *           type: string
 *           description: City name
 *           example: "Tehachapi"
 *         state:
 *           type: string
 *           description: State abbreviation
 *           example: "CA"
 *         zip_code:
 *           type: string
 *           description: ZIP code
 *           example: "93561"
 *         purchase_price:
 *           type: number
 *           format: double
 *           minimum: 0
 *           description: Purchase price in USD
 *           example: 500000
 *         escrow_status:
 *           type: string
 *           enum: [active, pending, closed, cancelled]
 *           description: Current status
 *           example: "active"
 *         acceptance_date:
 *           type: string
 *           format: date
 *           description: Offer acceptance date
 *           example: "2025-01-15"
 *         closing_date:
 *           type: string
 *           format: date
 *           description: Expected closing date
 *           example: "2025-03-01"
 *         buyers:
 *           type: array
 *           description: List of buyers
 *           items:
 *             $ref: '#/components/schemas/Person'
 *         sellers:
 *           type: array
 *           description: List of sellers
 *           items:
 *             $ref: '#/components/schemas/Person'
 *         listing_agent:
 *           $ref: '#/components/schemas/Agent'
 *         selling_agent:
 *           $ref: '#/components/schemas/Agent'
 *         escrow_company:
 *           type: string
 *           description: Escrow/title company name
 *           example: "First American Title"
 *         escrow_officer:
 *           type: string
 *           description: Escrow officer name
 *           example: "Jane Smith"
 *         property_type:
 *           type: string
 *           enum: [single_family, condo, townhouse, multi_family, land, commercial]
 *           example: "single_family"
 *         bedrooms:
 *           type: integer
 *           minimum: 0
 *           example: 3
 *         bathrooms:
 *           type: number
 *           format: float
 *           minimum: 0
 *           example: 2.5
 *         square_feet:
 *           type: integer
 *           minimum: 0
 *           example: 2400
 *         lot_size:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Lot size in acres
 *           example: 0.25
 *         year_built:
 *           type: integer
 *           minimum: 1800
 *           maximum: 2100
 *           example: 2015
 *         contingencies:
 *           type: array
 *           description: Active contingencies
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "inspection"
 *               due_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [pending, satisfied, waived, removed]
 *         earnest_money:
 *           type: number
 *           format: double
 *           minimum: 0
 *           description: Earnest money deposit amount
 *           example: 10000
 *         commission_rate:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 100
 *           description: Commission percentage
 *           example: 3.0
 *         notes:
 *           type: string
 *           description: Internal notes
 *         version:
 *           type: integer
 *           description: Optimistic locking version
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         last_modified_by:
 *           type: string
 *           format: uuid
 *           description: Last user to modify record
 *
 *     Listing:
 *       type: object
 *       description: Property listing record
 *       required:
 *         - address
 *         - list_price
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         mls_number:
 *           type: string
 *           description: MLS listing number
 *           example: "ML123456"
 *         address:
 *           type: string
 *           example: "456 Oak Ave, Tehachapi, CA 93561"
 *         city:
 *           type: string
 *           example: "Tehachapi"
 *         state:
 *           type: string
 *           example: "CA"
 *         zip_code:
 *           type: string
 *           example: "93561"
 *         list_price:
 *           type: number
 *           format: double
 *           minimum: 0
 *           example: 425000
 *         status:
 *           type: string
 *           enum: [active, pending, sold, withdrawn, expired]
 *           example: "active"
 *         property_type:
 *           type: string
 *           enum: [single_family, condo, townhouse, multi_family, land, commercial]
 *           example: "single_family"
 *         bedrooms:
 *           type: integer
 *           minimum: 0
 *           example: 4
 *         bathrooms:
 *           type: number
 *           format: float
 *           minimum: 0
 *           example: 3
 *         square_feet:
 *           type: integer
 *           minimum: 0
 *           example: 2800
 *         lot_size:
 *           type: number
 *           format: float
 *           minimum: 0
 *           example: 0.5
 *         year_built:
 *           type: integer
 *           example: 2010
 *         description:
 *           type: string
 *           description: Property description
 *         listing_date:
 *           type: string
 *           format: date
 *         expiration_date:
 *           type: string
 *           format: date
 *         photos:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *         virtual_tour_url:
 *           type: string
 *           format: uri
 *         showing_instructions:
 *           type: string
 *         days_on_market:
 *           type: integer
 *           minimum: 0
 *         price_per_sqft:
 *           type: number
 *           format: float
 *         version:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     Client:
 *       type: object
 *       description: Client/contact record
 *       required:
 *         - first_name
 *         - last_name
 *         - client_type
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         first_name:
 *           type: string
 *           example: "John"
 *         last_name:
 *           type: string
 *           example: "Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         phone:
 *           type: string
 *           example: "(555) 123-4567"
 *         client_type:
 *           type: string
 *           enum: [buyer, seller, both]
 *           example: "buyer"
 *         status:
 *           type: string
 *           enum: [active, inactive, closed]
 *           example: "active"
 *         source:
 *           type: string
 *           description: Lead source
 *           example: "Zillow"
 *         budget_min:
 *           type: number
 *           format: double
 *           minimum: 0
 *         budget_max:
 *           type: number
 *           format: double
 *           minimum: 0
 *         preferred_locations:
 *           type: array
 *           items:
 *             type: string
 *         property_preferences:
 *           type: object
 *           properties:
 *             bedrooms_min:
 *               type: integer
 *             bathrooms_min:
 *               type: number
 *               format: float
 *             square_feet_min:
 *               type: integer
 *             property_types:
 *               type: array
 *               items:
 *                 type: string
 *         pre_approved:
 *           type: boolean
 *           description: Pre-approved for financing
 *         pre_approval_amount:
 *           type: number
 *           format: double
 *         notes:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         version:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     Appointment:
 *       type: object
 *       description: Calendar appointment/showing
 *       required:
 *         - title
 *         - start_time
 *         - end_time
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *           example: "Property Showing - 123 Main St"
 *         description:
 *           type: string
 *         appointment_type:
 *           type: string
 *           enum: [showing, inspection, signing, meeting, call, other]
 *           example: "showing"
 *         start_time:
 *           type: string
 *           format: date-time
 *           example: "2025-02-01T14:00:00Z"
 *         end_time:
 *           type: string
 *           format: date-time
 *           example: "2025-02-01T15:00:00Z"
 *         location:
 *           type: string
 *           example: "123 Main St, Tehachapi, CA 93561"
 *         client_id:
 *           type: string
 *           format: uuid
 *         listing_id:
 *           type: string
 *           format: uuid
 *         escrow_id:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [scheduled, completed, cancelled, no_show]
 *           example: "scheduled"
 *         attendees:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *         reminder_sent:
 *           type: boolean
 *         notes:
 *           type: string
 *         version:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     Lead:
 *       type: object
 *       description: Prospective client lead
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "Jane Smith"
 *         email:
 *           type: string
 *           format: email
 *           example: "jane.smith@example.com"
 *         phone:
 *           type: string
 *           example: "(555) 987-6543"
 *         source:
 *           type: string
 *           description: How lead was acquired
 *           example: "Website Form"
 *         status:
 *           type: string
 *           enum: [new, contacted, qualified, unqualified, converted, lost]
 *           example: "new"
 *         lead_type:
 *           type: string
 *           enum: [buyer, seller, both]
 *           example: "buyer"
 *         interest_level:
 *           type: string
 *           enum: [hot, warm, cold]
 *           example: "warm"
 *         budget:
 *           type: number
 *           format: double
 *         timeline:
 *           type: string
 *           description: Expected timeline
 *           example: "3-6 months"
 *         message:
 *           type: string
 *           description: Initial inquiry message
 *         notes:
 *           type: string
 *         last_contact_date:
 *           type: string
 *           format: date-time
 *         next_follow_up:
 *           type: string
 *           format: date-time
 *         converted_to_client_id:
 *           type: string
 *           format: uuid
 *         version:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     # ============================================
 *     # NESTED SCHEMAS
 *     # ============================================
 *
 *     Person:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         phone:
 *           type: string
 *           example: "(555) 123-4567"
 *
 *     Agent:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Jayden Metz"
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         license:
 *           type: string
 *           description: Real estate license number
 *           example: "DRE #02209852"
 *         brokerage:
 *           type: string
 *           example: "Associated Real Estate"
 *
 *     # ============================================
 *     # RESPONSE SCHEMAS
 *     # ============================================
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           description: Response data (varies by endpoint)
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "VALIDATION_ERROR"
 *             message:
 *               type: string
 *               example: "Invalid request data"
 *             details:
 *               type: array
 *               items:
 *                 type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             type: object
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 20
 *             total:
 *               type: integer
 *               example: 150
 *             pages:
 *               type: integer
 *               example: 8
 *         timestamp:
 *           type: string
 *           format: date-time
 */

module.exports = {};

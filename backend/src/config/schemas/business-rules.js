/**
 * Business Rules for Real Estate CRM
 *
 * This file documents domain-specific rules for AI agents and developers.
 * These rules are enforced by businessRules.middleware.js
 */

module.exports = {
  /**
   * @openapi
   * components:
   *   x-business-rules:
   *     escrows:
   *       description: Rules for real estate transaction management
   *       rules:
   *         - id: escrow-address-required
   *           field: property_address
   *           rule: Property address is mandatory for all escrows
   *           severity: error
   *
   *         - id: escrow-future-closing
   *           field: closing_date
   *           rule: Closing date must be in the future when creating new escrow
   *           severity: warning
   *           exception: Can set past date for historical imports
   *
   *         - id: escrow-positive-price
   *           field: purchase_price
   *           rule: Purchase price must be positive if provided
   *           severity: error
   *           validation: purchase_price > 0
   *
   *         - id: escrow-address-immutable
   *           field: property_address
   *           rule: Property address cannot be changed after escrow creation
   *           severity: error
   *           applies_to: [update]
   *
   *         - id: escrow-status-transitions
   *           field: escrow_status
   *           rule: Valid status transitions are pending→active→closed or pending→cancelled
   *           severity: error
   *           valid_transitions:
   *             pending: [active, cancelled]
   *             active: [closed, cancelled]
   *             closed: []
   *             cancelled: []
   *
   *         - id: escrow-price-documentation
   *           field: purchase_price
   *           rule: Price changes should be documented in notes or audit log
   *           severity: warning
   *           applies_to: [update]
   *
   *         - id: escrow-broker-approval
   *           field: closing_date
   *           rule: Closing date changes may require broker approval
   *           severity: warning
   *           applies_to: [update]
   *           context: Changes affecting timeline should notify broker
   *
   *         - id: escrow-archive-before-delete
   *           rule: Only archived escrows can be permanently deleted
   *           severity: error
   *           applies_to: [delete]
   *
   *         - id: escrow-contingency-dates
   *           field: contingencies
   *           rule: Contingency removal dates must be before closing date
   *           severity: warning
   *
   *         - id: escrow-earnest-money
   *           field: earnest_money_amount
   *           rule: Earnest money typically 1-3% of purchase price
   *           severity: info
   *           validation: earnest_money_amount between (purchase_price * 0.01) and (purchase_price * 0.03)
   *
   *     listings:
   *       description: Rules for property listing management
   *       rules:
   *         - id: listing-address-required
   *           field: address
   *           rule: Property address is mandatory
   *           severity: error
   *
   *         - id: listing-price-required
   *           field: list_price
   *           rule: List price must be provided
   *           severity: error
   *
   *         - id: listing-positive-price
   *           field: list_price
   *           rule: List price must be positive
   *           severity: error
   *           validation: list_price > 0
   *
   *         - id: listing-future-expiration
   *           field: expiration_date
   *           rule: Expiration date must be in the future
   *           severity: warning
   *
   *         - id: listing-reasonable-bedrooms
   *           field: bedrooms
   *           rule: Bedrooms should be between 0 and 20
   *           severity: warning
   *           validation: bedrooms >= 0 AND bedrooms <= 20
   *
   *         - id: listing-reasonable-bathrooms
   *           field: bathrooms
   *           rule: Bathrooms should be between 0 and 15
   *           severity: warning
   *           validation: bathrooms >= 0 AND bathrooms <= 15
   *
   *         - id: listing-positive-sqft
   *           field: square_feet
   *           rule: Square footage must be positive if provided
   *           severity: error
   *           validation: square_feet > 0
   *
   *         - id: listing-status-transitions
   *           field: status
   *           rule: Valid status transitions are active→pending→sold or active→withdrawn/expired
   *           severity: error
   *           valid_transitions:
   *             active: [pending, withdrawn, expired]
   *             pending: [sold, active]
   *             sold: []
   *             withdrawn: [active]
   *             expired: [active]
   *
   *         - id: listing-mls-sync
   *           field: mls_number
   *           rule: MLS number should match Multiple Listing Service records
   *           severity: warning
   *           context: Validate against MLS database if integrated
   *
   *     clients:
   *       description: Rules for client contact management
   *       rules:
   *         - id: client-name-required
   *           field: first_name, last_name
   *           rule: Client must have at least first name or last name
   *           severity: error
   *
   *         - id: client-contact-method
   *           field: email, phone
   *           rule: Client must have at least one contact method (email or phone)
   *           severity: warning
   *
   *         - id: client-valid-email
   *           field: email
   *           rule: Email must be valid format if provided
   *           severity: error
   *           validation: Valid email regex
   *
   *         - id: client-budget-range
   *           field: budget_min, budget_max
   *           rule: Minimum budget must be less than maximum budget
   *           severity: error
   *           validation: budget_min < budget_max
   *
   *         - id: client-positive-budget
   *           field: budget_min, budget_max
   *           rule: Budget values must be positive
   *           severity: error
   *           validation: budget_min >= 0 AND budget_max > 0
   *
   *         - id: client-type-required
   *           field: client_type
   *           rule: Client type must be specified (buyer, seller, both)
   *           severity: error
   *           validation: client_type IN ['buyer', 'seller', 'both']
   *
   *         - id: client-duplicate-check
   *           field: email, phone
   *           rule: Check for duplicate clients with same email or phone
   *           severity: warning
   *           context: Warn before creating duplicate contacts
   *
   *     appointments:
   *       description: Rules for appointment and showing management
   *       rules:
   *         - id: appointment-title-required
   *           field: title
   *           rule: Appointment must have a title
   *           severity: error
   *
   *         - id: appointment-time-required
   *           field: start_time, end_time
   *           rule: Start and end times are required
   *           severity: error
   *
   *         - id: appointment-end-after-start
   *           field: start_time, end_time
   *           rule: End time must be after start time
   *           severity: error
   *           validation: end_time > start_time
   *
   *         - id: appointment-reasonable-duration
   *           field: start_time, end_time
   *           rule: Appointment duration should be between 15 minutes and 8 hours
   *           severity: warning
   *           validation: duration BETWEEN 15 minutes AND 8 hours
   *
   *         - id: appointment-future-time
   *           field: start_time
   *           rule: Appointments should be scheduled in the future
   *           severity: warning
   *           exception: Can create past appointments for records
   *
   *         - id: appointment-business-hours
   *           field: start_time
   *           rule: Showings typically during business hours (8 AM - 8 PM)
   *           severity: info
   *           context: Warn for appointments outside typical hours
   *
   *         - id: appointment-status-transitions
   *           field: status
   *           rule: Valid status transitions are scheduled→completed/cancelled/no_show
   *           severity: error
   *           valid_transitions:
   *             scheduled: [completed, cancelled, no_show]
   *             completed: []
   *             cancelled: []
   *             no_show: []
   *
   *     leads:
   *       description: Rules for lead qualification and management
   *       rules:
   *         - id: lead-name-required
   *           field: name
   *           rule: Lead must have a name
   *           severity: error
   *
   *         - id: lead-contact-method
   *           field: email, phone
   *           rule: Lead must have at least one contact method
   *           severity: warning
   *
   *         - id: lead-source-tracking
   *           field: source
   *           rule: Lead source should be tracked for marketing analytics
   *           severity: warning
   *           context: Important for ROI calculation
   *
   *         - id: lead-status-progression
   *           field: status
   *           rule: Leads should progress through stages new→contacted→qualified→converted
   *           severity: info
   *           valid_transitions:
   *             new: [contacted, unqualified, lost]
   *             contacted: [qualified, unqualified, lost]
   *             qualified: [converted, lost]
   *             unqualified: [contacted]
   *             converted: []
   *             lost: [contacted]
   *
   *         - id: lead-interest-level
   *           field: interest_level
   *           rule: Interest level helps prioritize follow-up (hot > warm > cold)
   *           severity: info
   *           validation: interest_level IN ['hot', 'warm', 'cold']
   *
   *         - id: lead-conversion-creates-client
   *           rule: Converting a lead should create a corresponding client record
   *           severity: error
   *           applies_to: [convert]
   *           context: Use /leads/{id}/convert endpoint
   *
   *     general:
   *       description: Cross-entity business rules
   *       rules:
   *         - id: california-compliance
   *           rule: All transactions must comply with California DRE regulations
   *           severity: info
   *           context: Broker license 01910265, Officer Josh Riley 01365477
   *
   *         - id: data-retention
   *           rule: Transaction records must be retained for 3 years minimum
   *           severity: info
   *           context: California DRE requirement
   *
   *         - id: audit-trail
   *           rule: All modifications should maintain audit trail
   *           severity: info
   *           context: Optimistic locking version field tracks changes
   *
   *         - id: user-data-isolation
   *           rule: Users can only access their own data or team data
   *           severity: error
   *           context: Enforced by user_id filtering in all queries
   *
   *         - id: price-formatting
   *           rule: Prices should be stored as numbers, formatted as currency for display
   *           severity: info
   *           context: Use toLocaleString('en-US', {style:'currency', currency:'USD'})
   *
   *         - id: date-formatting
   *           rule: Dates stored as ISO 8601 format (YYYY-MM-DD)
   *           severity: info
   *           context: Use YYYY-MM-DD for date fields
   */
};

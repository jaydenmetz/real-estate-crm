/**
 * Escrow People Controller
 * Handles all people-related operations for escrows
 */

const { fetchEscrowById } = require('./shared');
const { buildRestructuredEscrowResponse } = require('../../helpers/escrows.helper');
const { pool } = require('../../config/database');
const websocketService = require('../../services/websocket.service');

class EscrowPeopleController {
  /**
   * GET /v1/escrows/:id/people
   * Returns full contact objects for all people assigned to an escrow
   */
  static async getEscrowPeople(req, res) {
    try {
      const { id } = req.params;

      const escrow = await fetchEscrowById(id);

      if (!escrow) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found',
          },
        });
      }

      // Parse the people JSONB field
      // Expected structure: { buyer: "uuid", seller: "uuid", buyerAgent: "uuid", etc. }
      const peopleIds = escrow.people || {};

      // Extract all contact IDs that exist
      const contactIds = Object.values(peopleIds).filter(id => id && typeof id === 'string');

      if (contactIds.length === 0) {
        // No contacts assigned
        return res.json({
          success: true,
          data: {},
        });
      }

      // Fetch all contact records from the database
      const contactsResult = await pool.query(
        `SELECT
          id,
          contact_type,
          first_name,
          last_name,
          full_name,
          company,
          email,
          phone,
          phone_secondary,
          work_phone,
          street_address,
          city,
          state,
          zip_code,
          license_number,
          preferred_contact_method,
          notes,
          tags
        FROM contacts
        WHERE id = ANY($1::uuid[])
        AND deleted_at IS NULL`,
        [contactIds]
      );

      // Build a map of contact ID -> contact object
      const contactsById = {};
      contactsResult.rows.forEach(contact => {
        contactsById[contact.id] = contact;
      });

      // Build the response by mapping role -> full contact object
      const peopleWithContacts = {};
      Object.entries(peopleIds).forEach(([role, contactId]) => {
        if (contactId && contactsById[contactId]) {
          peopleWithContacts[role] = contactsById[contactId];
        }
      });

      res.json({
        success: true,
        data: peopleWithContacts,
      });
    } catch (error) {
      console.error('Error fetching escrow people:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow people',
        },
      });
    }
  }

  /**
   * PUT /v1/escrows/:id/people
   * Updates the people JSONB object for an escrow
   * Expects: { role: contactId, ... } e.g. { buyer: "uuid", seller: "uuid" }
   */
  static async updateEscrowPeople(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const escrow = await fetchEscrowById(id);

      if (!escrow) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found',
          },
        });
      }

      // Merge with existing people (partial updates supported)
      const existingPeople = escrow.people || {};
      const updatedPeople = { ...existingPeople, ...updates };

      // Update the people JSONB field with contact IDs
      const result = await pool.query(
        `UPDATE escrows
         SET people = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(updatedPeople), escrow.id]
      );

      const updatedEscrow = result.rows[0];

      // Broadcast WebSocket update
      websocketService.broadcastEscrowUpdate(escrow.id, {
        type: 'people:updated',
        data: updatedPeople,
      });

      // Return the updated people IDs (not full contact objects)
      res.json({
        success: true,
        data: updatedPeople,
      });
    } catch (error) {
      console.error('Error updating escrow people:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update escrow people',
        },
      });
    }
  }
}

module.exports = EscrowPeopleController;

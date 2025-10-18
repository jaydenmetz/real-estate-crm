/**
 * Escrow Documents Controller
 * Handles all document-related operations for escrows
 */

const { fetchEscrowById } = require('./shared');
const { buildRestructuredEscrowResponse } = require('../../helpers/escrows.helper');
const { pool } = require('../../config/database');
const websocketService = require('../../services/websocket.service');

class EscrowDocumentsController {
  /**
   * GET /v1/escrows/:id/documents
   * Returns the documents array for an escrow
   */
  static async getEscrowDocuments(req, res) {
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

      // Build the full response using the existing function
      const fullResponse = buildRestructuredEscrowResponse(escrow);

      // Return just the documents section
      res.json({
        success: true,
        data: fullResponse.documents,
      });
    } catch (error) {
      console.error('Error fetching escrow documents:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow documents',
        },
      });
    }
  }

  /**
   * PUT /v1/escrows/:id/documents
   * Replaces the entire documents array for an escrow
   */
  static async updateEscrowDocuments(req, res) {
    try {
      const { id } = req.params;
      const documents = req.body; // Expected: array of document objects

      if (!Array.isArray(documents)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Documents must be an array',
          },
        });
      }

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

      // Update the documents JSONB field
      const result = await pool.query(
        `UPDATE escrows
         SET documents = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(documents), escrow.id]
      );

      const updatedEscrow = result.rows[0];

      // Broadcast WebSocket update
      websocketService.broadcastEscrowUpdate(escrow.id, {
        type: 'documents:updated',
        data: documents,
      });

      // Build full response
      const fullResponse = buildRestructuredEscrowResponse(updatedEscrow);

      res.json({
        success: true,
        data: fullResponse.documents,
      });
    } catch (error) {
      console.error('Error updating escrow documents:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update escrow documents',
        },
      });
    }
  }

  /**
   * POST /v1/escrows/:id/documents
   * Adds a new document to the documents array
   */
  static async addEscrowDocument(req, res) {
    try {
      const { id } = req.params;
      const newDocument = req.body; // Expected: single document object

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

      // Get existing documents array
      const existingDocuments = escrow.documents || [];

      // Add new document with timestamp
      const documentWithMetadata = {
        ...newDocument,
        id: `doc_${Date.now()}`,
        uploadedAt: new Date().toISOString(),
      };

      const updatedDocuments = [...existingDocuments, documentWithMetadata];

      // Update the documents JSONB field
      const result = await pool.query(
        `UPDATE escrows
         SET documents = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(updatedDocuments), escrow.id]
      );

      const updatedEscrow = result.rows[0];

      // Broadcast WebSocket update
      websocketService.broadcastEscrowUpdate(escrow.id, {
        type: 'documents:added',
        data: documentWithMetadata,
      });

      // Build full response
      const fullResponse = buildRestructuredEscrowResponse(updatedEscrow);

      res.json({
        success: true,
        data: fullResponse.documents,
      });
    } catch (error) {
      console.error('Error adding escrow document:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to add escrow document',
        },
      });
    }
  }

  /**
   * DELETE /v1/escrows/:id/documents/:documentId
   * Removes a specific document from the documents array
   */
  static async deleteEscrowDocument(req, res) {
    try {
      const { id, documentId } = req.params;

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

      // Get existing documents array
      const existingDocuments = escrow.documents || [];

      // Filter out the document to delete
      const updatedDocuments = existingDocuments.filter(doc => doc.id !== documentId);

      if (updatedDocuments.length === existingDocuments.length) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'DOCUMENT_NOT_FOUND',
            message: 'Document not found in escrow',
          },
        });
      }

      // Update the documents JSONB field
      const result = await pool.query(
        `UPDATE escrows
         SET documents = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(updatedDocuments), escrow.id]
      );

      const updatedEscrow = result.rows[0];

      // Broadcast WebSocket update
      websocketService.broadcastEscrowUpdate(escrow.id, {
        type: 'documents:deleted',
        documentId,
      });

      // Build full response
      const fullResponse = buildRestructuredEscrowResponse(updatedEscrow);

      res.json({
        success: true,
        data: fullResponse.documents,
      });
    } catch (error) {
      console.error('Error deleting escrow document:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to delete escrow document',
        },
      });
    }
  }
}

module.exports = EscrowDocumentsController;

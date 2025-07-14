const { query } = require('../config/database');

/**
 * Generate enterprise-grade IDs for different entities
 * Format: {entity}_{year}_{sequence}_{team}
 * Example: esc_2025_001_jm
 */

const entityPrefixes = {
  escrow: { internal: 'esc_', external: 'ESC-' },
  contact: { internal: 'contact_', external: 'CONT-' },
  team: { internal: 'team_', external: 'TEAM-' },
  user: { internal: 'user_', external: 'USER-' },
  document: { internal: 'doc_', external: 'DOC-' },
  task: { internal: 'task_', external: 'TASK-' },
  activity: { internal: 'activity_', external: 'ACT-' }
};

/**
 * Generate IDs for escrows
 * @param {string} teamId - Team ID (e.g., team_jm_default)
 * @returns {Promise<{internal_id: string, external_id: string}>}
 */
async function generateEscrowIds(teamId) {
  try {
    const result = await query(
      'SELECT * FROM generate_escrow_ids($1)',
      [teamId]
    );
    
    return result.rows[0];
  } catch (error) {
    // Fallback to manual generation if function doesn't exist
    const year = new Date().getFullYear().toString();
    const teamSuffix = teamId.split('_')[1] || 'default';
    
    // Get next sequence
    const sequenceResult = await query(
      `
      SELECT COUNT(*) + 1 as next_seq
      FROM escrows
      WHERE internal_id LIKE $1
      `,
      [`esc_${year}_%_${teamSuffix}`]
    );
    
    const sequence = sequenceResult.rows[0].next_seq.toString().padStart(3, '0');
    
    return {
      internal_id: `esc_${year}_${sequence}_${teamSuffix}`,
      external_id: `ESC-${year}-${sequence}`
    };
  }
}

/**
 * Generate IDs for other entities
 * @param {string} entityType - Type of entity
 * @param {string} teamId - Team ID
 * @returns {Promise<{internal_id: string, external_id: string}>}
 */
async function generateEntityIds(entityType, teamId) {
  const prefixes = entityPrefixes[entityType];
  if (!prefixes) {
    throw new Error(`Unknown entity type: ${entityType}`);
  }
  
  const year = new Date().getFullYear().toString();
  const teamSuffix = teamId.split('_')[1] || 'default';
  
  // Get table name from entity type
  const tableName = entityType + 's'; // Simple pluralization
  
  // Get next sequence
  const sequenceResult = await query(
    `
    SELECT COUNT(*) + 1 as next_seq
    FROM ${tableName}
    WHERE internal_id LIKE $1
    `,
    [`${prefixes.internal}${year}_%_${teamSuffix}`]
  );
  
  const sequence = sequenceResult.rows[0].next_seq.toString().padStart(3, '0');
  
  return {
    internal_id: `${prefixes.internal}${year}_${sequence}_${teamSuffix}`,
    external_id: `${prefixes.external}${year}-${sequence}`
  };
}

/**
 * Parse an internal ID to extract components
 * @param {string} internalId - Internal ID to parse
 * @returns {{entity: string, year: string, sequence: string, team: string}}
 */
function parseInternalId(internalId) {
  const parts = internalId.split('_');
  
  if (parts.length < 4) {
    throw new Error('Invalid internal ID format');
  }
  
  return {
    entity: parts[0],
    year: parts[1],
    sequence: parts[2],
    team: parts.slice(3).join('_') // Handle team names with underscores
  };
}

/**
 * Validate an internal ID format
 * @param {string} internalId - Internal ID to validate
 * @returns {boolean}
 */
function isValidInternalId(internalId) {
  try {
    const parsed = parseInternalId(internalId);
    
    // Check entity prefix
    const validPrefixes = Object.keys(entityPrefixes).map(k => entityPrefixes[k].internal.replace('_', ''));
    if (!validPrefixes.includes(parsed.entity)) {
      return false;
    }
    
    // Check year format
    if (!/^\d{4}$/.test(parsed.year)) {
      return false;
    }
    
    // Check sequence format
    if (!/^\d{3}$/.test(parsed.sequence)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  generateEscrowIds,
  generateEntityIds,
  parseInternalId,
  isValidInternalId,
  entityPrefixes
};
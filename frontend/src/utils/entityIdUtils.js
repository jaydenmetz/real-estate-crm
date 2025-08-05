/**
 * Utility functions for handling entity IDs with prefixes
 */

/**
 * Add entity prefix to an ID if it doesn't already have one
 * @param {string} id - The ID (UUID)
 * @param {string} entityType - The entity type (escrow, listing, client, etc.)
 * @returns {string} The prefixed ID
 */
export const addEntityPrefix = (id, entityType) => {
  if (!id) return id;
  
  // Convert to string if it's not already
  const idStr = String(id);
  
  // NO PREFIXES - Always return the ID as-is for escrows
  if (entityType === 'escrow' || entityType === 'escrows') {
    // Remove any existing escrow- prefix if present
    if (idStr.startsWith('escrow-')) {
      return idStr.substring(7);
    }
    return idStr;
  }
  
  // Map entity types to prefixes (keeping for other entities if needed)
  const prefixMap = {
    listing: 'listing-',
    listings: 'listing-',
    client: 'client-',
    clients: 'client-',
    lead: 'lead-',
    leads: 'lead-',
    appointment: 'appointment-',
    appointments: 'appointment-',
    user: 'user-',
    users: 'user-',
    agent: 'agent-',
    agents: 'agent-',
    task: 'task-',
    tasks: 'task-',
    document: 'doc-',
    documents: 'doc-',
    timeline: 'timeline-',
    checklist: 'checklist-'
  };
  
  const prefix = prefixMap[entityType.toLowerCase()] || `${entityType.toLowerCase()}-`;
  
  // Check if ID already has this prefix
  if (idStr.startsWith(prefix)) {
    return idStr;
  }
  
  // Check if ID has any common prefix
  const commonPrefixes = Object.values(prefixMap);
  const hasPrefix = commonPrefixes.some(p => idStr.startsWith(p));
  
  if (hasPrefix) {
    // Already has a different prefix, don't add another
    return idStr;
  }
  
  // Add the prefix
  return `${prefix}${idStr}`;
};

/**
 * Remove entity prefix from an ID
 * @param {string} id - The prefixed ID
 * @returns {string} The ID without prefix
 */
export const removeEntityPrefix = (id) => {
  if (!id || typeof id !== 'string') return id;
  
  // Common prefixes to remove
  const prefixes = [
    'escrow-',
    'listing-',
    'client-',
    'lead-',
    'appointment-',
    'user-',
    'agent-',
    'task-',
    'doc-',
    'timeline-',
    'checklist-'
  ];
  
  for (const prefix of prefixes) {
    if (id.startsWith(prefix)) {
      return id.substring(prefix.length);
    }
  }
  
  return id;
};

/**
 * Get the entity type from a prefixed ID
 * @param {string} id - The prefixed ID
 * @returns {string|null} The entity type or null if no prefix
 */
export const getEntityTypeFromId = (id) => {
  if (!id || typeof id !== 'string') return null;
  
  const prefixTypeMap = {
    'escrow-': 'escrow',
    'listing-': 'listing',
    'client-': 'client',
    'lead-': 'lead',
    'appointment-': 'appointment',
    'user-': 'user',
    'agent-': 'agent',
    'task-': 'task',
    'doc-': 'document',
    'timeline-': 'timeline',
    'checklist-': 'checklist'
  };
  
  for (const [prefix, type] of Object.entries(prefixTypeMap)) {
    if (id.startsWith(prefix)) {
      return type;
    }
  }
  
  return null;
};

/**
 * Format an ID for display (adds prefix if needed)
 * @param {string} id - The ID
 * @param {string} entityType - The entity type
 * @returns {string} The formatted ID
 */
export const formatEntityId = (id, entityType) => {
  if (!id) return '';
  
  // Convert to string if it's not already
  const idStr = String(id);
  
  // For display IDs like ESC-2025-0001 or ESCROW-2025-0001, return as-is
  if (idStr.match(/^[A-Z]+-\d{4}-\d+$/)) {
    return idStr;
  }
  
  // For numeric IDs, return as-is
  if (/^\d+$/.test(idStr)) {
    return idStr;
  }
  
  // NO PREFIXES for escrows - strip any existing prefix
  if (entityType === 'escrow' || entityType === 'escrows') {
    if (idStr.startsWith('escrow-')) {
      return idStr.substring(7);
    }
    return idStr;
  }
  
  // Special handling for IDs that start with shortened prefixes
  // For non-escrow entities only
  const shortPrefixMap = {
    'list': 'listing-',
    'cli': 'client-',
    'appt': 'appointment-',
  };
  
  for (const [shortPrefix, fullPrefix] of Object.entries(shortPrefixMap)) {
    if (idStr.startsWith(shortPrefix) && !idStr.startsWith(fullPrefix)) {
      // Replace short prefix with full prefix
      return fullPrefix + idStr.substring(shortPrefix.length);
    }
  }
  
  // For UUIDs, add prefix (but not for escrows)
  return addEntityPrefix(idStr, entityType);
};

/**
 * Check if an ID has an entity prefix
 * @param {string} id - The ID to check
 * @returns {boolean} True if the ID has a recognized prefix
 */
export const hasEntityPrefix = (id) => {
  return getEntityTypeFromId(id) !== null;
};
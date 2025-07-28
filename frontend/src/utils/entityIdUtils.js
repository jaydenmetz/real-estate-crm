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
  
  // Map entity types to prefixes
  const prefixMap = {
    escrow: 'escrow-',
    escrows: 'escrow-',
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
  if (id.startsWith(prefix)) {
    return id;
  }
  
  // Check if ID has any common prefix
  const commonPrefixes = Object.values(prefixMap);
  const hasPrefix = commonPrefixes.some(p => id.startsWith(p));
  
  if (hasPrefix) {
    // Already has a different prefix, don't add another
    return id;
  }
  
  // Add the prefix
  return `${prefix}${id}`;
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
  
  // For display IDs like ESCROW-2025-0001, return as-is
  if (id.match(/^[A-Z]+-\d{4}-\d+$/)) {
    return id;
  }
  
  // For numeric IDs, return as-is
  if (/^\d+$/.test(id)) {
    return id;
  }
  
  // Special handling for IDs that start with shortened prefixes
  // Convert "esc" to "escrow-", "list" to "listing-", etc.
  const shortPrefixMap = {
    'esc': 'escrow-',
    'list': 'listing-',
    'cli': 'client-',
    'appt': 'appointment-',
  };
  
  for (const [shortPrefix, fullPrefix] of Object.entries(shortPrefixMap)) {
    if (id.startsWith(shortPrefix) && !id.startsWith(fullPrefix)) {
      // Replace short prefix with full prefix
      return fullPrefix + id.substring(shortPrefix.length);
    }
  }
  
  // For UUIDs, add prefix
  return addEntityPrefix(id, entityType);
};

/**
 * Check if an ID has an entity prefix
 * @param {string} id - The ID to check
 * @returns {boolean} True if the ID has a recognized prefix
 */
export const hasEntityPrefix = (id) => {
  return getEntityTypeFromId(id) !== null;
};
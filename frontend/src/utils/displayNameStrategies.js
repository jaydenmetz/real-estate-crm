/**
 * Display Name Strategies
 *
 * Provides consistent title/display name computation for all entity types.
 * Each entity can have a custom display_name saved in the database.
 * If not set, we compute a sensible default based on entity data.
 *
 * Entity Types and Default Display Names:
 * - Escrows: display_address || property_address || "No Address"
 * - Listings: display_address || property_address || "No Address"
 * - Clients: display_name || full_name || first_name + last_name || "Unknown Client"
 * - Leads: display_name || first_name + last_name || "Unknown Lead"
 * - Appointments: display_name || title || appointment_type || "Untitled Appointment"
 *
 * @module utils/displayNameStrategies
 */

/**
 * Get display name for an escrow
 * @param {Object} escrow - Escrow data object
 * @returns {string} Display name to show
 */
export const getEscrowDisplayName = (escrow) => {
  if (!escrow) return 'No Address';

  // Escrows use display_address for their title (property-based)
  return escrow.display_address
    || escrow.property_address
    || 'No Address';
};

/**
 * Get display name for a listing
 * @param {Object} listing - Listing data object
 * @returns {string} Display name to show
 */
export const getListingDisplayName = (listing) => {
  if (!listing) return 'No Address';

  // Listings use display_address for their title (property-based)
  return listing.display_address
    || listing.property_address
    || 'No Address';
};

/**
 * Get display name for a client
 * Supports entity types: individual, trust, corporation, llc, partnership, estate, power_of_attorney
 * For non-individual entity types, entity_name is the primary display name
 * @param {Object} client - Client data object
 * @returns {string} Display name to show
 */
export const getClientDisplayName = (client) => {
  if (!client) return 'Unknown Client';

  // First check for custom display_name
  if (client.display_name) {
    return client.display_name;
  }

  // For entity types (non-individual), use entity_name as primary display
  const entityType = client.entity_type || client.entityType;
  if (entityType && entityType !== 'individual' && (client.entity_name || client.entityName)) {
    return client.entity_name || client.entityName;
  }

  // Fall back to computed name from contact info
  if (client.full_name) {
    return client.full_name;
  }

  const firstName = client.first_name || client.firstName || '';
  const lastName = client.last_name || client.lastName || '';

  if (firstName || lastName) {
    return `${firstName} ${lastName}`.trim();
  }

  return 'Unknown Client';
};

/**
 * Get display name for a lead
 * @param {Object} lead - Lead data object
 * @returns {string} Display name to show
 */
export const getLeadDisplayName = (lead) => {
  if (!lead) return 'Unknown Lead';

  // First check for custom display_name
  if (lead.display_name) {
    return lead.display_name;
  }

  // Fall back to computed name
  const firstName = lead.first_name || lead.firstName || '';
  const lastName = lead.last_name || lead.lastName || '';

  if (firstName || lastName) {
    return `${firstName} ${lastName}`.trim();
  }

  // Last resort: use email
  if (lead.email) {
    return lead.email;
  }

  return 'Unknown Lead';
};

/**
 * Get display name for an appointment
 * @param {Object} appointment - Appointment data object
 * @returns {string} Display name to show
 */
export const getAppointmentDisplayName = (appointment) => {
  if (!appointment) return 'Untitled Appointment';

  // First check for custom display_name
  if (appointment.display_name) {
    return appointment.display_name;
  }

  // Fall back to title
  if (appointment.title) {
    return appointment.title;
  }

  // Fall back to appointment type with client name
  const appointmentType = appointment.appointment_type || appointment.appointmentType || '';
  const clientName = appointment.client_name || appointment.clientName || '';

  if (appointmentType && clientName) {
    return `${appointmentType} - ${clientName}`;
  }

  if (appointmentType) {
    return appointmentType;
  }

  return 'Untitled Appointment';
};

/**
 * Get display name for any entity by type
 * @param {string} entityType - Type of entity (escrow, listing, client, lead, appointment)
 * @param {Object} data - Entity data object
 * @returns {string} Display name to show
 */
export const getDisplayName = (entityType, data) => {
  switch (entityType?.toLowerCase()) {
    case 'escrow':
    case 'escrows':
      return getEscrowDisplayName(data);
    case 'listing':
    case 'listings':
      return getListingDisplayName(data);
    case 'client':
    case 'clients':
      return getClientDisplayName(data);
    case 'lead':
    case 'leads':
      return getLeadDisplayName(data);
    case 'appointment':
    case 'appointments':
      return getAppointmentDisplayName(data);
    default:
      return data?.display_name || data?.title || data?.name || 'Unknown';
  }
};

/**
 * Get subtitle for an entity by type
 *
 * Subtitle patterns per entity type:
 * - Escrows: City, State, Zip Code
 * - Listings: City, State, Zip Code
 * - Clients: Phone number and email (if available)
 * - Leads: Phone number and email (if available)
 * - Appointments: Full address
 *
 * @param {string} entityType - Type of entity
 * @param {Object} data - Entity data object
 * @returns {string|null} Subtitle to show, or null if none
 */
export const getSubtitle = (entityType, data) => {
  if (!data) return null;

  switch (entityType?.toLowerCase()) {
    case 'escrow':
    case 'escrows':
    case 'listing':
    case 'listings': {
      // Property-based entities show city, state, zip
      const parts = [];
      if (data.city) parts.push(data.city);
      if (data.state) parts.push(data.state);
      if (data.zip_code || data.zipCode) parts.push(data.zip_code || data.zipCode);
      return parts.length > 0 ? parts.join(', ') : null;
    }
    case 'client':
    case 'clients': {
      // For entity types (non-individual), show representative name and title
      const entityType = data.entity_type || data.entityType;
      if (entityType && entityType !== 'individual') {
        const firstName = data.first_name || data.firstName || '';
        const lastName = data.last_name || data.lastName || '';
        const representativeTitle = data.representative_title || data.representativeTitle || '';
        const representativeName = `${firstName} ${lastName}`.trim();

        if (representativeName && representativeTitle) {
          return `${representativeName}, ${representativeTitle}`;
        }
        if (representativeName) {
          return representativeName;
        }
      }
      // For individuals, show phone and email
      const phone = data.phone || '';
      const email = data.email || '';
      const parts = [phone, email].filter(Boolean);
      return parts.length > 0 ? parts.join(' • ') : null;
    }
    case 'lead':
    case 'leads': {
      // People-based entities show phone and email
      const phone = data.phone || '';
      const email = data.email || '';
      const parts = [phone, email].filter(Boolean);
      return parts.length > 0 ? parts.join(' • ') : null;
    }
    case 'appointment':
    case 'appointments': {
      // Appointments show full address (from first stop or location)
      // Check first stop address first
      const firstStopAddress = data.first_stop_address || data.firstStopAddress;
      const firstStopCity = data.first_stop_city || data.firstStopCity;
      const firstStopState = data.first_stop_state || data.firstStopState;
      const firstStopZip = data.first_stop_zip || data.firstStopZip;

      if (firstStopAddress) {
        const parts = [firstStopAddress];
        if (firstStopCity) parts.push(firstStopCity);
        if (firstStopState) parts.push(firstStopState);
        if (firstStopZip) parts.push(firstStopZip);
        return parts.join(', ');
      }

      // Fall back to location field
      if (data.location) {
        return data.location;
      }

      return null;
    }
    default:
      return data?.subtitle || null;
  }
};

export default {
  getDisplayName,
  getSubtitle,
  getEscrowDisplayName,
  getListingDisplayName,
  getClientDisplayName,
  getLeadDisplayName,
  getAppointmentDisplayName,
};

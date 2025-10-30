import React from 'react';
import { DetailTemplate } from '../../../templates/Detail';
import { escrowsConfig } from '../../../config/entities/escrows.config';

/**
 * Escrow Detail Page
 *
 * Uses DetailTemplate with escrowsConfig for rendering
 * All configuration is defined in escrows.config.js
 *
 * MIGRATED: October 30, 2025
 * - Reduced from 420 lines to 15 lines
 * - Now uses universal DetailTemplate like clients
 * - Backend Detail API data flows automatically
 * - Widgets configured via escrows.config.js
 */
const EscrowDetail = () => {
  return <DetailTemplate config={escrowsConfig} />;
};

export default EscrowDetail;

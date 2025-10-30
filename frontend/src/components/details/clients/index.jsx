import React from 'react';
import { DetailTemplate } from '../../../templates/Detail';
import { clientsConfig } from '../../../config/entities/clients.config';

/**
 * Client Detail Page
 *
 * Uses DetailTemplate with clientsConfig for rendering
 * All configuration is defined in clients.config.js
 */
const ClientDetail = () => {
  return <DetailTemplate config={clientsConfig} />;
};

export default ClientDetail;

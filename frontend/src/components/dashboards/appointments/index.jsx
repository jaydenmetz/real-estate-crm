import React from 'react';
import { DashboardTemplate } from '../../../templates/Dashboard';
import { appointmentsConfig } from '../../../config/entities/appointments.config';
import { AppointmentCard } from './view-modes';
import { NewAppointmentModal } from './modals';

const AppointmentsDashboard = () => {
  return (
    <DashboardTemplate
      config={appointmentsConfig}
      CardComponent={AppointmentCard}
      NewItemModal={NewAppointmentModal}
    />
  );
};

export default AppointmentsDashboard;

import React from 'react';
import { DashboardTemplate } from '../../../templates/Dashboard';
import { appointmentsConfig } from '../../../config/entities/appointments.config';
import { AppointmentCard } from '../../common/view-modes/card';
import NewAppointmentModal from './modals/NewAppointmentModal';

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

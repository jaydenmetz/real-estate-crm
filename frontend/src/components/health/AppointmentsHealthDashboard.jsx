import HealthDashboardBase from './HealthDashboardBase';

const AppointmentsHealthDashboard = () => {
  return (
    <HealthDashboardBase
      moduleName="appointments"
      moduleTitle="Appointments"
      healthCheckMethod="runAppointmentsHealthCheck"
    />
  );
};

export default AppointmentsHealthDashboard;

import HealthDashboardBase from './HealthDashboardBase';

const ClientsHealthDashboard = () => {
  return (
    <HealthDashboardBase
      moduleName="clients"
      moduleTitle="Clients"
      healthCheckMethod="runClientsHealthCheck"
    />
  );
};

export default ClientsHealthDashboard;

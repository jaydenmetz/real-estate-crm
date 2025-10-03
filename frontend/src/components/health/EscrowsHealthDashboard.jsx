import HealthDashboardBase from './HealthDashboardBase';

const EscrowsHealthDashboard = () => {
  return (
    <HealthDashboardBase
      moduleName="escrows"
      moduleTitle="Escrows"
      healthCheckMethod="runEscrowsHealthCheck"
    />
  );
};

export default EscrowsHealthDashboard;

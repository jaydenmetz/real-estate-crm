import HealthDashboardBase from './HealthDashboardBase';

const LeadsHealthDashboard = () => {
  return (
    <HealthDashboardBase
      moduleName="leads"
      moduleTitle="Leads"
      healthCheckMethod="runLeadsHealthCheck"
    />
  );
};

export default LeadsHealthDashboard;

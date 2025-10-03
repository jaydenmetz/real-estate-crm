import HealthDashboardBase from './HealthDashboardBase';

const ListingsHealthDashboard = () => {
  return (
    <HealthDashboardBase
      moduleName="listings"
      moduleTitle="Listings"
      healthCheckMethod="runListingsHealthCheck"
    />
  );
};

export default ListingsHealthDashboard;

import React from 'react';
import DashboardStatCard from '../../../../../templates/Dashboard/components/DashboardStatCard';

/**
 * QualifiedLeadsCard - Shows count of qualified leads
 *
 * @param {Array} data - Leads data
 * @param {number} delay - Animation delay multiplier
 */
const QualifiedLeadsCard = ({ data = [], delay = 2, ...props }) => {
  // Count qualified leads
  const qualifiedCount = data.filter(item => {
    const status = (item.lead_status || item.status || '').toLowerCase();
    return status === 'qualified';
  }).length;

  return (
    <DashboardStatCard
      icon="VerifiedUser"
      title="QUALIFIED LEADS"
      value={qualifiedCount}
      format="number"
      color="#8b5cf6"
      textColor="#fff"
      delay={delay}
      {...props}
    />
  );
};

export default QualifiedLeadsCard;

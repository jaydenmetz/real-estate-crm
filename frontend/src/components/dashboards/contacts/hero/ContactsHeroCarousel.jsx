import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardHero } from '../../../../templates/Dashboard/components/DashboardHero';
import { leadsAPI, clientsAPI } from '../../../../services/api.service';

/**
 * ContactsHeroCarousel - Wrapper for the contacts hero section
 *
 * Unlike escrows which has a carousel with multiple pages,
 * contacts uses the spheres layout mode which shows:
 * - Nested spheres visualization (Sphere > Leads > Clients)
 * - AI Coach card
 * - Action buttons
 *
 * This component computes sphere data from:
 * - allData (contacts passed from DashboardTemplate)
 * - leadsAPI (fetches lead count)
 * - clientsAPI (fetches client count)
 *
 * And provides navigation via onSphereClick.
 */
const ContactsHeroCarousel = ({
  // All props that would normally go to DashboardHero
  config,
  stats,
  statsConfig,
  selectedStatus,
  onNewItem,
  dateRangeFilter,
  setDateRangeFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  dateRange,
  detectPresetRange,
  selectedYear,
  setSelectedYear,
  StatCardComponent,
  allData,
  // Spheres-specific props (may be passed from config, but we compute them)
  aiCoachConfig,
}) => {
  const navigate = useNavigate();

  // Fetch leads count for sphere data
  const { data: leadsData } = useQuery({
    queryKey: ['leads', 'sphere-count'],
    queryFn: async () => {
      const response = await leadsAPI.getAll({ limit: 1 });
      return response.success ? (response.data?.pagination?.total || response.data?.leads?.length || 0) : 0;
    },
    staleTime: 30000, // Cache for 30 seconds
  });

  // Fetch clients count for sphere data
  const { data: clientsData } = useQuery({
    queryKey: ['clients', 'sphere-count'],
    queryFn: async () => {
      const response = await clientsAPI.getAll({ limit: 1 });
      return response.success ? (response.data?.pagination?.total || response.data?.clients?.length || 0) : 0;
    },
    staleTime: 30000, // Cache for 30 seconds
  });

  // Calculate sphere data from fetched data
  const sphereData = useMemo(() => {
    const contactCount = Array.isArray(allData) ? allData.length : 0;
    const leadsCount = typeof leadsData === 'number' ? leadsData : 0;
    const clientsCount = typeof clientsData === 'number' ? clientsData : 0;

    return {
      sphere: contactCount,
      leads: leadsCount,
      clients: clientsCount,
    };
  }, [allData, leadsData, clientsData]);

  // Handle sphere click - navigate to appropriate dashboard
  const handleSphereClick = (sphereType) => {
    switch (sphereType) {
      case 'sphere':
        // Already on contacts
        break;
      case 'leads':
        navigate('/leads');
        break;
      case 'clients':
        navigate('/clients');
        break;
      default:
        break;
    }
  };

  // Ensure config includes spheres layout mode
  const enhancedConfig = {
    ...config,
    heroLayoutMode: 'spheres',
  };

  return (
    <DashboardHero
      config={enhancedConfig}
      stats={stats}
      statsConfig={statsConfig}
      selectedStatus={selectedStatus}
      onNewItem={onNewItem}
      dateRangeFilter={dateRangeFilter}
      setDateRangeFilter={setDateRangeFilter}
      customStartDate={customStartDate}
      setCustomStartDate={setCustomStartDate}
      customEndDate={customEndDate}
      setCustomEndDate={setCustomEndDate}
      dateRange={dateRange}
      detectPresetRange={detectPresetRange}
      selectedYear={selectedYear}
      setSelectedYear={setSelectedYear}
      StatCardComponent={StatCardComponent}
      allData={allData}
      // Spheres-specific props (computed in this component)
      heroLayoutMode="spheres"
      sphereData={sphereData}
      onSphereClick={handleSphereClick}
      aiCoachConfig={aiCoachConfig || {
        title: 'AI Coach',
        description: 'Get personalized coaching to grow your sphere of influence and convert more leads to clients.',
        onHire: null, // Coming soon
      }}
    />
  );
};

export default ContactsHeroCarousel;

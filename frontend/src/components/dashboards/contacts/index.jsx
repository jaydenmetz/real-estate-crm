import React, { useMemo, useState, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DashboardHero } from '../../../templates/Dashboard/components/DashboardHero';
import { DashboardNavigation } from '../../../templates/Dashboard/components/DashboardNavigation';
import { DashboardContent } from '../../../templates/Dashboard/components/DashboardContent';
import { contactsConfig } from '../../../config/entities/contacts.config';
import { ContactCard } from './view-modes';
import { NewContactModal } from './modals';
import { contactsAPI, leadsAPI, clientsAPI } from '../../../services/api.service';
import { useQuery } from '@tanstack/react-query';

/**
 * ContactsDashboard - Dashboard with Spheres hero layout
 *
 * This dashboard uses the 'spheres' hero layout mode to display
 * the contact hierarchy visualization:
 * - Sphere of Influence (all contacts)
 * - Leads (subset of contacts)
 * - Clients (subset of leads)
 */
const ContactsDashboard = () => {
  const navigate = useNavigate();
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('last_name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Date range states (for consistency with template)
  const [dateRangeFilter, setDateRangeFilter] = useState('1M');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch contacts data
  const { data: contactsData, isLoading: contactsLoading, refetch: refetchContacts } = useQuery({
    queryKey: ['contacts', 'all'],
    queryFn: async () => {
      const response = await contactsAPI.getAll({ limit: 1000 });
      return response.success ? (response.data?.contacts || response.data || []) : [];
    },
  });

  // Fetch leads count for sphere data
  const { data: leadsData } = useQuery({
    queryKey: ['leads', 'count'],
    queryFn: async () => {
      const response = await leadsAPI.getAll({ limit: 1 });
      return response.success ? (response.data?.pagination?.total || response.data?.leads?.length || 0) : 0;
    },
  });

  // Fetch clients count for sphere data
  const { data: clientsData } = useQuery({
    queryKey: ['clients', 'count'],
    queryFn: async () => {
      const response = await clientsAPI.getAll({ limit: 1 });
      return response.success ? (response.data?.pagination?.total || response.data?.clients?.length || 0) : 0;
    },
  });

  // Calculate sphere data from fetched data
  const sphereData = useMemo(() => {
    const contactCount = Array.isArray(contactsData) ? contactsData.length : 0;
    const leadsCount = typeof leadsData === 'number' ? leadsData : 0;
    const clientsCount = typeof clientsData === 'number' ? clientsData : 0;

    return {
      sphere: contactCount,
      leads: leadsCount,
      clients: clientsCount,
    };
  }, [contactsData, leadsData, clientsData]);

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

  // Calculate date range (simplified version)
  const calculatedDateRange = useMemo(() => {
    if (!dateRangeFilter && !(customStartDate && customEndDate)) {
      return null;
    }
    const now = new Date();
    let startDate, endDate;

    if (customStartDate && customEndDate) {
      startDate = customStartDate;
      endDate = customEndDate;
    } else {
      switch(dateRangeFilter) {
        case '1D':
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case '1M':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          endDate = now;
          break;
        case '1Y':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 365);
          endDate = now;
          break;
        case 'YTD':
          startDate = new Date(selectedYear, 0, 1);
          if (selectedYear === now.getFullYear()) {
            endDate = now;
          } else {
            endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
          }
          break;
        default:
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          endDate = now;
      }
    }

    return { startDate, endDate };
  }, [dateRangeFilter, customStartDate, customEndDate, selectedYear]);

  // Filter contacts by status
  const filteredData = useMemo(() => {
    const contacts = Array.isArray(contactsData) ? contactsData : [];
    // For now, show all contacts - filtering by role would require backend support
    return contacts;
  }, [contactsData, selectedStatus]);

  // Detect preset range
  const detectPresetRange = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    const now = new Date();
    const diffDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));

    if (startDate.toDateString() === now.toDateString() && endDate.toDateString() === now.toDateString()) return '1D';
    if (diffDays >= 29 && diffDays <= 31) return '1M';
    if (diffDays >= 364 && diffDays <= 366) return '1Y';

    const ytdStart = new Date(now.getFullYear(), 0, 1);
    if (Math.abs(startDate - ytdStart) < 86400000 && Math.abs(endDate - now) < 86400000) return 'YTD';

    return null;
  };

  // Handle create
  const handleCreate = async (contactData) => {
    try {
      await refetchContacts();
      setNewItemModalOpen(false);
    } catch (err) {
      console.error('Failed to create contact:', err);
    }
  };

  // Get available years
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2];
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Hero with Spheres Layout */}
      <DashboardHero
        config={{
          title: 'Contacts',
          subtitle: 'Manage your sphere of influence',
          gradient: `linear-gradient(135deg, ${contactsConfig.entity.colorGradient.start} 0%, ${contactsConfig.entity.colorGradient.end} 100%)`,
          entitySingular: 'Contact',
          showAnalyticsButton: contactsConfig.dashboard.hero.showAnalyticsButton,
          analyticsButtonLabel: contactsConfig.dashboard.hero.analyticsButtonLabel,
          addButtonLabel: contactsConfig.dashboard.hero.addButtonLabel,
          showAIAssistant: false, // Using AI Coach instead
        }}
        stats={{}}
        statsConfig={[]}
        selectedStatus={selectedStatus}
        onNewItem={() => setNewItemModalOpen(true)}
        dateRangeFilter={dateRangeFilter}
        setDateRangeFilter={setDateRangeFilter}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        dateRange={calculatedDateRange}
        detectPresetRange={detectPresetRange}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        allData={filteredData}
        // Sphere layout props
        heroLayoutMode="spheres"
        sphereData={sphereData}
        onSphereClick={handleSphereClick}
        aiCoachConfig={{
          title: 'AI Coach',
          description: 'Get personalized coaching to grow your sphere of influence and convert more leads to clients.',
          onHire: null, // Coming soon
        }}
      />

      {/* Navigation - simplified for contacts */}
      <DashboardNavigation
        config={{
          ...contactsConfig.dashboard,
          entity: contactsConfig.entity,
        }}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        selectedItems={[]}
        totalCount={filteredData.length}
        onClearSelection={() => {}}
        onSelectAll={() => {}}
      />

      {/* Content Grid */}
      <DashboardContent
        loading={contactsLoading}
        data={filteredData}
        viewMode={viewMode}
        CardComponent={ContactCard}
        config={contactsConfig}
        selectedStatus={selectedStatus}
      />

      {/* New Contact Modal */}
      <NewContactModal
        open={newItemModalOpen}
        onClose={() => setNewItemModalOpen(false)}
        onCreate={handleCreate}
      />
    </Container>
  );
};

export default ContactsDashboard;

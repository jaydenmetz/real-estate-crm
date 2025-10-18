import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { clientsAPI } from '../../../services/api.service';
import { useAuth } from '../../../contexts/AuthContext';
import NewClientModal from '../../forms/NewClientModal';
import networkMonitor from '../../../services/networkMonitor.service';
import { useWebSocket } from '../../../hooks/useWebSocket';
import ClientHeroCard from './components/ClientHeroCard';
import ClientNavigation from './components/ClientNavigation';
import ClientContent from './components/ClientContent';
import { useClientHandlers } from './hooks/useClientHandlers';
import { detectPresetRange, filterClients, sortClients } from './utils/clientUtils';

const ClientsDashboard = () => {
  const { user } = useAuth();
  const { isConnected, connectionStatus } = useWebSocket();
  const [clients, setClients] = useState([]);
  const [archivedClients, setArchivedClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('clientsViewMode');
    return saved || 'large';
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [scope, setScope] = useState(() => {
    const saved = localStorage.getItem('clientsScope');
    return saved || 'team';
  }); // 'brokerage', 'team', 'user'
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [archivedCount, setArchivedCount] = useState(0);
  const [selectedArchivedIds, setSelectedArchivedIds] = useState([]);
  const [batchDeleting, setBatchDeleting] = useState(false);

  // Date range filter state
  const [dateRangeFilter, setDateRangeFilter] = useState('1M'); // '1D', '1M', '1Y', 'YTD', or null for custom
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [newClientModalOpen, setNewClientModalOpen] = useState(false);

  // Network monitoring state
  const [networkData, setNetworkData] = useState({
    stats: networkMonitor.getStats(),
    requests: networkMonitor.getRequests(),
  });

  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    newThisMonth: 0,
    totalClientValue: 0,
    avgClientLifetime: 0,
    convertedLeads: 0,
    conversionRate: 0,
    potentialValue: 0,
    avgConversionTime: 0,
    totalInactive: 0,
    inactiveRate: 0,
    lostValue: 0,
    avgDaysInactive: 0,
    totalPortfolioValue: 0,
    avgTransactionsPerClient: 0,
  });

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('clientsViewMode', viewMode);
  }, [viewMode]);

  // Save scope to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('clientsScope', scope);
  }, [scope]);

  // Calculate date range based on filter or custom dates
  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    // Use custom dates if both are set
    if (customStartDate && customEndDate) {
      startDate = customStartDate;
      endDate = customEndDate;

      // Auto-detect if custom dates match a preset
      const matchedPreset = detectPresetRange(startDate, endDate);
      if (matchedPreset && dateRangeFilter !== matchedPreset) {
        setDateRangeFilter(matchedPreset);
      } else if (!matchedPreset && dateRangeFilter !== null) {
        setDateRangeFilter(null);
      }
    } else {
      // Use preset range
      switch(dateRangeFilter) {
        case '1D':
          // Today from 12:00 AM to 11:59 PM
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0); // Midnight
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999); // End of day
          break;
        case '1M':
          // Last 30 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          endDate = now;
          break;
        case '1Y':
          // Last 365 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 365);
          endDate = now;
          break;
        case 'YTD':
          // Year to date
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = now;
          break;
        default:
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          endDate = now;
      }
    }

    // Validate dates before formatting
    const validStart = startDate instanceof Date && !isNaN(startDate.getTime()) ? startDate : new Date();
    const validEnd = endDate instanceof Date && !isNaN(endDate.getTime()) ? endDate : new Date();

    return {
      startDate: validStart,
      endDate: validEnd,
      label: `${validStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${validEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    };
  };

  const dateRange = getDateRange();

  const calculateStats = (clientData, statusFilter = 'active') => {
    if (!clientData || !Array.isArray(clientData)) {
      setStats({
        totalClients: 0,
        activeClients: 0,
        newThisMonth: 0,
        totalClientValue: 0,
        avgClientLifetime: 0,
        convertedLeads: 0,
        conversionRate: 0,
        potentialValue: 0,
        avgConversionTime: 0,
        totalInactive: 0,
        inactiveRate: 0,
        lostValue: 0,
        avgDaysInactive: 0,
        totalPortfolioValue: 0,
        avgTransactionsPerClient: 0,
      });
      return;
    }

    // Get date range for filtering
    const { startDate, endDate } = getDateRange();

    // Filter clients by date range (based on created_at)
    const dateFilteredClients = clientData.filter(c => {
      const createdDate = new Date(c.createdAt || c.created_at);
      return createdDate >= startDate && createdDate <= endDate;
    });

    let filteredClients = [];

    // Filter based on selected status
    switch (statusFilter) {
      case 'active':
        filteredClients = dateFilteredClients.filter(c =>
          c.clientStatus === 'Active' || c.client_status === 'Active' ||
          c.clientStatus === 'active' || c.client_status === 'active'
        );
        break;
      case 'lead':
        filteredClients = dateFilteredClients.filter(c =>
          c.clientStatus === 'Lead' || c.client_status === 'Lead' ||
          c.clientStatus === 'lead' || c.client_status === 'lead'
        );
        break;
      case 'inactive':
        filteredClients = dateFilteredClients.filter(c =>
          c.clientStatus === 'Inactive' || c.client_status === 'Inactive' ||
          c.clientStatus === 'inactive' || c.client_status === 'inactive'
        );
        break;
      default:
        filteredClients = dateFilteredClients;
    }

    // Calculate stats based on status
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Active clients stats
    const activeClients = clientData.filter(c =>
      c.clientStatus === 'Active' || c.client_status === 'Active' ||
      c.clientStatus === 'active' || c.client_status === 'active'
    );
    const newThisMonth = activeClients.filter(c => {
      const createdDate = new Date(c.createdAt || c.created_at);
      return createdDate >= startOfMonth;
    }).length;
    const totalClientValue = filteredClients.reduce((sum, c) => sum + Number(c.totalValue || c.total_value || 0), 0);
    const avgClientLifetime = filteredClients.length > 0 ? totalClientValue / filteredClients.length : 0;

    // Lead conversion stats
    const convertedLeads = clientData.filter(c =>
      (c.clientStatus === 'Active' || c.client_status === 'Active') &&
      (c.previousStatus === 'Lead' || c.previous_status === 'Lead')
    ).length;
    const totalLeads = clientData.filter(c =>
      c.clientStatus === 'Lead' || c.client_status === 'Lead'
    ).length;
    const conversionRate = (totalLeads + convertedLeads) > 0 ? (convertedLeads / (totalLeads + convertedLeads)) * 100 : 0;
    const potentialValue = totalLeads * 50000; // Mock: $50k potential per lead
    const avgConversionTime = 45; // Mock: 45 days average

    // Inactive stats
    const inactiveClients = clientData.filter(c =>
      c.clientStatus === 'Inactive' || c.client_status === 'Inactive'
    );
    const totalInactive = inactiveClients.length;
    const totalAllClients = clientData.length;
    const inactiveRate = totalAllClients > 0 ? (totalInactive / totalAllClients) * 100 : 0;
    const lostValue = inactiveClients.reduce((sum, c) => sum + Number(c.totalValue || c.total_value || 0), 0);
    const avgDaysInactive = 180; // Mock: 180 days average

    // All clients stats
    const totalPortfolioValue = clientData.reduce((sum, c) => sum + Number(c.totalValue || c.total_value || 0), 0);
    const totalTransactions = clientData.reduce((sum, c) => sum + Number(c.totalTransactions || c.total_transactions || 0), 0);
    const avgTransactionsPerClient = clientData.length > 0 ? totalTransactions / clientData.length : 0;

    setStats({
      totalClients: filteredClients.length,
      activeClients: activeClients.length,
      newThisMonth,
      totalClientValue,
      avgClientLifetime,
      convertedLeads,
      conversionRate,
      potentialValue,
      avgConversionTime,
      totalInactive,
      inactiveRate,
      lostValue,
      avgDaysInactive,
      totalPortfolioValue,
      avgTransactionsPerClient,
    });
  };

  const fetchClients = async (pageNum = 1, appendData = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Fetch clients with pagination (50 per page for optimal performance)
      const response = await clientsAPI.getAll({
        includeArchived: true,
        page: pageNum,
        limit: 50,
        scope: scope // Pass scope from state
      });

      if (response.success) {
        const allData = response.data.clients || response.data || [];
        const pagination = response.data.pagination || {};
        const totalPages = pagination.totalPages || 1;
        const totalRecords = pagination.total || allData.length;
        const hasMore = pageNum < totalPages;

        // Separate active and archived clients based on deleted_at field
        const clientData = allData.filter(client => !client.deleted_at && !client.deletedAt);
        const archivedData = allData.filter(client => client.deleted_at || client.deletedAt);

        // Update state based on whether we're appending or replacing
        if (appendData) {
          setClients(prev => [...prev, ...clientData]);
          setArchivedClients(prev => [...prev, ...archivedData]);
        } else {
          setClients(clientData);
          setArchivedClients(archivedData);
        }

        // Update pagination state
        setCurrentPage(pageNum);
        setHasMorePages(hasMore);
        setTotalCount(totalRecords);
        setArchivedCount(archivedData.length);

        // Calculate stats from currently loaded data only
        const currentClients = appendData ? [...clients, ...clientData] : clientData;
        calculateStats(currentClients, selectedStatus);
      } else {
        console.error('API returned success: false', response);
      }
    } catch (error) {
      console.error('Error fetching clients:', error.message);
      console.error('Full error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreClients = useCallback(() => {
    if (!loadingMore && hasMorePages) {
      fetchClients(currentPage + 1, true);
    }
  }, [loadingMore, hasMorePages, currentPage]);

  // PHASE 6: Refetch clients when scope changes
  useEffect(() => {
    fetchClients();
  }, [scope]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Cmd/Ctrl + K: Create new client
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setNewClientModalOpen(true);
        return;
      }

      // Cmd/Ctrl + R: Refresh clients
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        fetchClients();
        return;
      }

      // Cmd/Ctrl + A: Toggle select all (archived view only)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a' && selectedStatus === 'archived') {
        e.preventDefault();
        const allSelected = selectedArchivedIds.length === archivedClients.length;
        handlers.handleSelectAll(!allSelected);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [newClientModalOpen, selectedStatus, selectedArchivedIds.length, archivedClients.length]);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedStatus === 'archived') {
      // Calculate stats for archived clients
      calculateStats(archivedClients, 'archived');
    } else if (clients.length > 0) {
      calculateStats(clients, selectedStatus);
    } else {
      calculateStats([], selectedStatus);
    }
  }, [selectedStatus, clients, archivedClients, dateRangeFilter, customStartDate, customEndDate]);

  // Sync archived count with archived clients array
  useEffect(() => {
    setArchivedCount(archivedClients.length);
  }, [archivedClients]);

  // Network monitoring polling
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkData({
        stats: networkMonitor.getStats(),
        requests: networkMonitor.getRequests(),
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // WebSocket real-time updates
  useEffect(() => {
    if (!isConnected) return;

    const websocketService = require('../../../services/websocket.service').default;

    const unsubscribe = websocketService.on('data:update', (data) => {
      if (data.entityType === 'client') {
        fetchClients();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected]);

  // Use client handlers hook (MUST be after fetchClients and calculateStats definitions)
  const handlers = useClientHandlers({
    clients,
    setClients,
    archivedClients,
    setArchivedClients,
    setArchivedCount,
    selectedStatus,
    calculateStats,
    fetchClients,
    selectedArchivedIds,
    setSelectedArchivedIds,
    setBatchDeleting,
  });

  // Filter and sort clients for display
  const filteredClients = filterClients(
    selectedStatus === 'archived' ? archivedClients : clients,
    selectedStatus
  );
  const sortedClients = sortClients(filteredClients, sortBy);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Hero Section with Stats */}
        <ClientHeroCard
          dateRangeFilter={dateRangeFilter}
          setDateRangeFilter={setDateRangeFilter}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          dateRange={dateRange}
          detectPresetRange={detectPresetRange}
          selectedStatus={selectedStatus}
          stats={stats}
          archivedCount={archivedCount}
          setNewClientModalOpen={setNewClientModalOpen}
        />

        {/* Navigation Bar */}
        <ClientNavigation
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
          scope={scope}
          setScope={setScope}
          setCalendarDialogOpen={setCalendarDialogOpen}
          archivedCount={archivedCount}
          showCalendar={showCalendar}
          setShowCalendar={setShowCalendar}
        />

        {/* Main Content */}
        <ClientContent
          loading={loading}
          selectedStatus={selectedStatus}
          viewMode={viewMode}
          sortedClients={sortedClients}
          archivedClients={archivedClients}
          loadingMore={loadingMore}
          hasMorePages={hasMorePages}
          handleLoadMore={loadMoreClients}
          selectedArchivedIds={selectedArchivedIds}
          setSelectedArchivedIds={setSelectedArchivedIds}
          handleBatchDelete={handlers.handleBatchDelete}
          batchDeleting={batchDeleting}
          handleSelectAll={handlers.handleSelectAll}
          totalCount={totalCount}
        />

        {/* New Client Modal */}
        <NewClientModal
          open={newClientModalOpen}
          onClose={() => setNewClientModalOpen(false)}
          onSuccess={(newClientId) => {
            setNewClientModalOpen(false);
            fetchClients();
          }}
        />

        {/* Calendar Dialog (placeholder for future implementation) */}
        <Dialog
          open={calendarDialogOpen}
          onClose={() => setCalendarDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Calendar View</DialogTitle>
          <DialogContent>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              Calendar view coming soon...
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCalendarDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default ClientsDashboard;

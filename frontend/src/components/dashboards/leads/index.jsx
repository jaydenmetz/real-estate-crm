import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import { leadsAPI } from '../../../services/api.service';
import NewLeadModal from './modals/NewLeadModal';
import { useAuth } from '../../../contexts/AuthContext';
import { useWebSocket } from '../../../hooks/useWebSocket';
import LeadHeroCard from './components/LeadHeroCard';
import LeadNavigation from './components/LeadNavigation';
import LeadContent from './components/LeadContent';
import LeadStatsGrid from './components/LeadStatsGrid';
import { useLeadHandlers } from './hooks/useLeadHandlers';

const LeadsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, connectionStatus } = useWebSocket();
  const [leads, setLeads] = useState([]);
  const [archivedLeads, setArchivedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('new');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('leadsViewMode') || 'large');
  const [sortBy, setSortBy] = useState('created_at');
  const [scope, setScope] = useState(() => localStorage.getItem('leadsScope') || 'team');
  const [dateRangeFilter, setDateRangeFilter] = useState('1M');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [archivedCount, setArchivedCount] = useState(0);
  const [selectedArchivedIds, setSelectedArchivedIds] = useState([]);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [newLeadModalOpen, setNewLeadModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalLeads: 0, newLeads: 0, thisWeek: 0, thisMonth: 0, responseRate: 0,
    qualifiedLeads: 0, qualificationRate: 0, avgQualificationTime: 0, hotLeads: 0,
    convertedLeads: 0, conversionRate: 0, avgConversionTime: 0, totalValue: 0,
    lostLeads: 0, lostRate: 0, lostValue: 0, topLostReason: '',
    activeLeads: 0, avgLeadValue: 0
  });

  // Save preferences to localStorage
  useEffect(() => { localStorage.setItem('leadsViewMode', viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem('leadsScope', scope); }, [scope]);

  // Refetch leads when scope changes
  useEffect(() => { fetchLeads(); }, [scope]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const isModKey = e.metaKey || e.ctrlKey;
      if (isModKey) {
        switch(e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            if (!newLeadModalOpen) setNewLeadModalOpen(true);
            break;
          case 'r':
            e.preventDefault();
            fetchLeads();
            break;
          case 'a':
            if (selectedStatus === 'archived') {
              e.preventDefault();
              if (selectedArchivedIds.length === archivedLeads.length) {
                setSelectedArchivedIds([]);
              } else {
                setSelectedArchivedIds(archivedLeads.map(l => l.id));
              }
            }
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [newLeadModalOpen, selectedStatus, selectedArchivedIds, archivedLeads]);

  // Initial fetch
  useEffect(() => { fetchLeads(); }, []);

  // Recalculate stats when data changes
  useEffect(() => {
    if (selectedStatus === 'archived') {
      calculateStats(archivedLeads, 'archived');
    } else if (leads.length > 0) {
      calculateStats(leads, selectedStatus);
    } else {
      calculateStats([], selectedStatus);
    }
  }, [selectedStatus, leads, archivedLeads, dateRangeFilter, customStartDate, customEndDate]);

  // Sync archived count
  useEffect(() => { setArchivedCount(archivedLeads.length); }, [archivedLeads]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!isConnected) return;
    const websocketService = require('../../../services/websocket.service').default;
    const unsubscribe = websocketService.on('data:update', (data) => {
      if (data.entityType === 'lead') fetchLeads();
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [isConnected]);

  // Helper functions - MUST be defined before useLeadHandlers
  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const detectPresetRange = (start, end) => {
    if (!start || !end) return null;
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const startDay = new Date(start);
    startDay.setHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setHours(0, 0, 0, 0);

    if (isSameDay(startDay, today) && isSameDay(endDay, today)) return '1D';
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 30);
    if (isSameDay(startDay, oneMonthAgo) && isSameDay(endDay, today)) return '1M';
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(today.getDate() - 365);
    if (isSameDay(startDay, oneYearAgo) && isSameDay(endDay, today)) return '1Y';
    const ytdStart = new Date(now.getFullYear(), 0, 1);
    if (isSameDay(startDay, ytdStart) && isSameDay(endDay, today)) return 'YTD';
    return null;
  };

  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    if (customStartDate && customEndDate) {
      startDate = customStartDate;
      endDate = customEndDate;
      const matchedPreset = detectPresetRange(startDate, endDate);
      if (matchedPreset && dateRangeFilter !== matchedPreset) {
        setDateRangeFilter(matchedPreset);
      } else if (!matchedPreset && dateRangeFilter !== null) {
        setDateRangeFilter(null);
      }
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
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case '1Y':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 365);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'YTD':
          startDate = new Date(now.getFullYear(), 0, 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          return null;
      }
    }
    return { startDate, endDate };
  };

  const calculateStats = (data, statusFilter) => {
    if (!data || !Array.isArray(data)) {
      setStats({
        totalLeads: 0, newLeads: 0, thisWeek: 0, thisMonth: 0, responseRate: 0,
        qualifiedLeads: 0, qualificationRate: 0, avgQualificationTime: 0, hotLeads: 0,
        convertedLeads: 0, conversionRate: 0, avgConversionTime: 0, totalValue: 0,
        lostLeads: 0, lostRate: 0, lostValue: 0, topLostReason: '',
        activeLeads: 0, avgLeadValue: 0
      });
      return;
    }

    const dateRange = getDateRange();
    let dateFilteredData = data;
    if (dateRange) {
      dateFilteredData = data.filter(lead => {
        const createdDate = new Date(lead.createdAt || lead.created_at || 0);
        return createdDate >= dateRange.startDate && createdDate <= dateRange.endDate;
      });
    }

    let filtered = dateFilteredData.filter(l => {
      const status = (l.leadStatus || l.lead_status || '').toLowerCase();
      if (statusFilter === 'new') return status === 'new';
      if (statusFilter === 'qualified') return status === 'qualified';
      if (statusFilter === 'converted') return status === 'converted';
      if (statusFilter === 'lost') return status === 'lost';
      if (statusFilter === 'contacted') return status === 'contacted';
      return true;
    });

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const newLeadsData = dateFilteredData.filter(l => (l.leadStatus || l.lead_status || '').toLowerCase() === 'new');
    const thisWeek = newLeadsData.filter(l => new Date(l.createdAt || l.created_at || 0) >= startOfWeek).length;
    const thisMonth = newLeadsData.filter(l => new Date(l.createdAt || l.created_at || 0) >= startOfMonth).length;
    const responseRate = newLeadsData.length > 0 ? Math.round((thisWeek / newLeadsData.length) * 100) : 0;

    const qualifiedLeadsData = dateFilteredData.filter(l => (l.leadStatus || l.lead_status || '').toLowerCase() === 'qualified');
    const qualificationRate = dateFilteredData.length > 0 ? Math.round((qualifiedLeadsData.length / dateFilteredData.length) * 100) : 0;
    const avgQualificationTime = 3;
    const hotLeads = qualifiedLeadsData.filter(l => (l.leadScore || l.lead_score || 0) >= 80).length;

    const convertedLeadsData = dateFilteredData.filter(l => (l.leadStatus || l.lead_status || '').toLowerCase() === 'converted');
    const conversionRate = dateFilteredData.length > 0 ? Math.round((convertedLeadsData.length / dateFilteredData.length) * 100) : 0;
    const avgConversionTime = 14;
    const totalValue = convertedLeadsData.reduce((sum, l) => sum + Number(l.estimatedValue || 0), 0);

    const lostLeadsData = dateFilteredData.filter(l => (l.leadStatus || l.lead_status || '').toLowerCase() === 'lost');
    const lostRate = dateFilteredData.length > 0 ? Math.round((lostLeadsData.length / dateFilteredData.length) * 100) : 0;
    const lostValue = lostLeadsData.reduce((sum, l) => sum + Number(l.estimatedValue || 0), 0);
    const topLostReason = 'Price too high';

    const activeLeads = dateFilteredData.filter(l => {
      const status = (l.leadStatus || l.lead_status || '').toLowerCase();
      return status !== 'lost' && status !== 'converted';
    }).length;
    const avgLeadValue = dateFilteredData.length > 0
      ? Math.round(dateFilteredData.reduce((sum, l) => sum + Number(l.estimatedValue || 0), 0) / dateFilteredData.length)
      : 0;

    setStats({
      totalLeads: filtered.length, newLeads: newLeadsData.length, thisWeek, thisMonth, responseRate,
      qualifiedLeads: qualifiedLeadsData.length, qualificationRate, avgQualificationTime, hotLeads,
      convertedLeads: convertedLeadsData.length, conversionRate, avgConversionTime, totalValue,
      lostLeads: lostLeadsData.length, lostRate, lostValue, topLostReason,
      activeLeads, avgLeadValue,
    });
  };

  const fetchLeads = async (pageNum = 1, appendData = false) => {
    try {
      if (appendData) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setCurrentPage(1);
      }

      const response = await leadsAPI.getAll({
        includeArchived: true,
        page: pageNum,
        limit: 50,
        scope: scope
      });

      if (response.success) {
        const allData = response.data.leads || response.data || [];
        const pagination = response.data.pagination || {};
        const totalPages = pagination.totalPages || 1;
        const totalRecords = pagination.total || allData.length;
        const hasMore = pageNum < totalPages;

        const leadData = allData.filter(lead => !lead.deleted_at && !lead.deletedAt);
        const archivedData = allData.filter(lead => lead.deleted_at || lead.deletedAt);

        if (appendData) {
          setLeads(prev => [...prev, ...leadData]);
          setArchivedLeads(prev => [...prev, ...archivedData]);
        } else {
          setLeads(leadData);
          setArchivedLeads(archivedData);
        }

        setCurrentPage(pageNum);
        setHasMorePages(hasMore);
        setTotalCount(totalRecords);
        setArchivedCount(archivedData.length);

        const currentLeads = appendData ? [...leads, ...leadData] : leadData;
        calculateStats(currentLeads, selectedStatus);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreLeads = useCallback(() => {
    if (!loadingMore && hasMorePages) {
      fetchLeads(currentPage + 1, true);
    }
  }, [loadingMore, hasMorePages, currentPage]);

  // Use lead handlers hook
  const handlers = useLeadHandlers({
    leads,
    setLeads,
    archivedLeads,
    setArchivedLeads,
    setArchivedCount,
    selectedStatus,
    calculateStats,
    fetchLeads,
    selectedArchivedIds,
    setSelectedArchivedIds,
    setBatchDeleting,
  });

  // Filter and sort leads
  const filteredLeads = leads.filter(l => {
    const status = (l.leadStatus || l.lead_status || '').toLowerCase();
    switch (selectedStatus) {
      case 'new': return status === 'new';
      case 'contacted': return status === 'contacted';
      case 'qualified': return status === 'qualified';
      case 'converted': return status === 'converted';
      case 'lost': return status === 'lost';
      default: return true;
    }
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    switch(sortBy) {
      case 'created_at':
        return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
      case 'lead_score':
        return Number(b.leadScore || b.lead_score || 0) - Number(a.leadScore || a.lead_score || 0);
      case 'first_name':
        return (a.firstName || a.first_name || '').localeCompare(b.firstName || b.first_name || '');
      case 'email':
        return (a.email || '').localeCompare(b.email || '');
      case 'status':
        return (a.leadStatus || a.lead_status || '').localeCompare(b.leadStatus || b.lead_status || '');
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  const dateRange = getDateRange();

  return (
    <>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Hero Section with Stats */}
        <LeadHeroCard
          dateRangeFilter={dateRangeFilter}
          setDateRangeFilter={setDateRangeFilter}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          dateRange={dateRange}
          detectPresetRange={detectPresetRange}
        >
          <LeadStatsGrid
            selectedStatus={selectedStatus}
            stats={stats}
            archivedCount={archivedCount}
            maxArchivedLimit={500}
            setNewLeadModalOpen={setNewLeadModalOpen}
          />
        </LeadHeroCard>

        {/* Navigation Bar */}
        <LeadNavigation
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
        />

        {/* Main Content */}
        <LeadContent
          loading={loading}
          selectedStatus={selectedStatus}
          viewMode={viewMode}
          sortedLeads={sortedLeads}
          archivedLeads={archivedLeads}
          handleLeadClick={handlers.handleLeadClick}
          handleArchive={handlers.handleArchive}
          handleRestore={handlers.handleRestore}
          handleUpdateLead={handlers.handleUpdateLead}
          loadingMore={loadingMore}
          hasMorePages={hasMorePages}
          handleLoadMore={loadMoreLeads}
          selectedArchivedIds={selectedArchivedIds}
          setSelectedArchivedIds={setSelectedArchivedIds}
          handleBatchDelete={handlers.handleBatchDelete}
          batchDeleting={batchDeleting}
          handleSelectAll={handlers.handleSelectAll}
          totalCount={totalCount}
        />

        {/* New Lead Modal */}
        <NewLeadModal
          open={newLeadModalOpen}
          onClose={() => setNewLeadModalOpen(false)}
          onSuccess={(newLeadId) => {
            setNewLeadModalOpen(false);
            fetchLeads();
          }}
        />

        {/* Calendar Dialog */}
        <Dialog
          open={calendarDialogOpen}
          onClose={() => setCalendarDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Calendar View
            <IconButton
              onClick={() => setCalendarDialogOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              ✕
            </IconButton>
          </DialogTitle>
          <DialogContent>
            Calendar view coming soon. View your leads by created date, last contact, or follow-up date.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCalendarDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default LeadsDashboard;

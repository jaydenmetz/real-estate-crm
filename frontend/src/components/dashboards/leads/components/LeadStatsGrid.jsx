import React from 'react';
import { Grid, Box, Button } from '@mui/material';
import {
  PersonAdd,
  Phone,
  Email,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Assessment,
  Star,
  AttachMoney,
  Cancel,
  Archive as ArchiveIcon,
  Storage,
  Add,
} from '@mui/icons-material';
import LeadStatCard from './LeadStatCard';

const LeadStatsGrid = ({
  selectedStatus,
  stats,
  archivedCount,
  maxArchivedLimit = 500,
  setNewLeadModalOpen,
}) => {
  return (
    <Box sx={{
      display: 'flex',
      gap: 3,
      alignItems: 'stretch',
      flexDirection: { xs: 'column', md: 'row' },
      height: '100%',
    }}>
      {/* Left container: Stats Grid */}
      <Box sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}>
        {/* Stats Grid - White Cards - Dynamic based on selected tab */}
        <Grid container spacing={2}>
          {(() => {
            switch(selectedStatus) {
              case 'new':
                return (
                  <>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={PersonAdd}
                        title="Total New Leads"
                        value={stats.newLeads || 0}
                        color="#ffffff"
                        delay={0}
                        goal={50}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={Phone}
                        title="This Week"
                        value={stats.thisWeek || 0}
                        color="#ffffff"
                        delay={1}
                        goal={10}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={Email}
                        title="This Month"
                        value={stats.thisMonth || 0}
                        color="#ffffff"
                        delay={2}
                        goal={30}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={TrendingUp}
                        title="Response Rate"
                        value={stats.responseRate || 0}
                        suffix="%"
                        color="#ffffff"
                        delay={3}
                        goal={80}
                      />
                    </Grid>
                  </>
                );

              case 'qualified':
                return (
                  <>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={CheckCircle}
                        title="Total Qualified"
                        value={stats.qualifiedLeads || 0}
                        color="#ffffff"
                        delay={0}
                        goal={25}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={TrendingUp}
                        title="Qualification Rate"
                        value={stats.qualificationRate || 0}
                        suffix="%"
                        color="#ffffff"
                        delay={1}
                        goal={50}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={Assessment}
                        title="Avg Qualification Time"
                        value={stats.avgQualificationTime || 0}
                        suffix=" days"
                        color="#ffffff"
                        delay={2}
                        goal={5}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={Star}
                        title="Hot Leads"
                        value={stats.hotLeads || 0}
                        color="#ffffff"
                        delay={3}
                        goal={10}
                      />
                    </Grid>
                  </>
                );

              case 'converted':
                return (
                  <>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={CheckCircle}
                        title="Total Converted"
                        value={stats.convertedLeads || 0}
                        color="#ffffff"
                        delay={0}
                        goal={15}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={TrendingUp}
                        title="Conversion Rate"
                        value={stats.conversionRate || 0}
                        suffix="%"
                        color="#ffffff"
                        delay={1}
                        goal={30}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={Assessment}
                        title="Avg Conversion Time"
                        value={stats.avgConversionTime || 0}
                        suffix=" days"
                        color="#ffffff"
                        delay={2}
                        goal={21}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={AttachMoney}
                        title="Total Value"
                        value={stats.totalValue || 0}
                        prefix="$"
                        color="#ffffff"
                        delay={3}
                        goal={500000}
                      />
                    </Grid>
                  </>
                );

              case 'lost':
                return (
                  <>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={Cancel}
                        title="Total Lost"
                        value={stats.lostLeads || 0}
                        color="#ffffff"
                        delay={0}
                        goal={10}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={TrendingDown}
                        title="Lost Rate"
                        value={stats.lostRate || 0}
                        suffix="%"
                        color="#ffffff"
                        delay={1}
                        goal={20}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={AttachMoney}
                        title="Lost Value"
                        value={stats.lostValue || 0}
                        prefix="$"
                        color="#ffffff"
                        delay={2}
                        goal={100000}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={Assessment}
                        title="Top Lost Reason"
                        value={stats.topLostReason || 'N/A'}
                        color="#ffffff"
                        delay={3}
                      />
                    </Grid>
                  </>
                );

              case 'archived':
                return (
                  <>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={ArchiveIcon}
                        title="Total Archived Leads"
                        value={archivedCount || 0}
                        color="#ffffff"
                        delay={0}
                        goal={100}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={Storage}
                        title="Max Archived"
                        value={archivedCount || 0}
                        suffix={` / ${maxArchivedLimit}`}
                        color="#ffffff"
                        delay={1}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={CheckCircle}
                        title="Qualified Leads"
                        value={stats.qualifiedLeads || 0}
                        color="#ffffff"
                        delay={2}
                        goal={25}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={AttachMoney}
                        title="Total Value"
                        value={stats.totalValue || 0}
                        prefix="$"
                        color="#ffffff"
                        delay={3}
                        goal={500000}
                      />
                    </Grid>
                  </>
                );

              case 'contacted':
                return (
                  <>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={Phone}
                        title="Total Contacted"
                        value={stats.totalLeads || 0}
                        color="#ffffff"
                        delay={0}
                        goal={40}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={CheckCircle}
                        title="Qualification Rate"
                        value={stats.qualificationRate || 0}
                        suffix="%"
                        color="#ffffff"
                        delay={1}
                        goal={50}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={Star}
                        title="Hot Leads"
                        value={stats.hotLeads || 0}
                        color="#ffffff"
                        delay={2}
                        goal={10}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={Assessment}
                        title="Avg Lead Score"
                        value={stats.avgLeadValue || 0}
                        color="#ffffff"
                        delay={3}
                        goal={75}
                      />
                    </Grid>
                  </>
                );

              default: // 'all'
                return (
                  <>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={PersonAdd}
                        title="Total Leads"
                        value={stats.totalLeads || 0}
                        color="#ffffff"
                        delay={0}
                        goal={100}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={CheckCircle}
                        title="Active Leads"
                        value={stats.activeLeads || 0}
                        color="#ffffff"
                        delay={1}
                        goal={60}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={TrendingUp}
                        title="Conversion Rate"
                        value={stats.conversionRate || 0}
                        suffix="%"
                        color="#ffffff"
                        delay={2}
                        goal={30}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <LeadStatCard
                        icon={AttachMoney}
                        title="Avg Lead Value"
                        value={stats.avgLeadValue || 0}
                        prefix="$"
                        color="#ffffff"
                        delay={3}
                        goal={10000}
                      />
                    </Grid>
                  </>
                );
            }
          })()}
        </Grid>
      </Box>

      {/* Right container: AI Assistant (always visible) */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: { xs: '100%', md: 280 },
        maxWidth: { xs: '100%', md: 350 },
        flexShrink: 0,
      }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 2,
            p: 3,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            height: { xs: 'auto', md: '100%' },
            minHeight: { md: 200 },
          }}
        >
          <Box>
            <Box sx={{ fontSize: '2rem', mb: 1 }}>🤖</Box>
            <Box sx={{ fontSize: '1.125rem', fontWeight: 600, mb: 1 }}>
              Lead AI Manager
            </Box>
            <Box sx={{ fontSize: '0.875rem', opacity: 0.9, mb: 2 }}>
              AI-powered lead qualification, smart follow-ups, and predictive insights
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setNewLeadModalOpen(true)}
            sx={{
              mt: 'auto',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Create New Lead
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LeadStatsGrid;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Typography
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  X as CloseIcon
} from 'lucide-react';
import { styled } from '@mui/material/styles';

// Components
import { DetailHero } from './components/DetailHero';
import { DetailSidebar } from './components/DetailSidebar';
import { DetailActivityFeed } from './components/DetailActivityFeed';

const PageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: 'calc(100vh - 64px)',
  backgroundColor: theme.palette.grey[50],
  paddingBottom: theme.spacing(10), // Space for activity feed tab
}));

const LayoutContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  maxWidth: '1800px',
  margin: '0 auto',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  paddingLeft: theme.spacing(8), // Extra padding for left toggle button space
  paddingRight: theme.spacing(8), // Extra padding for right toggle button space
  position: 'relative',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
}));

const Sidebar = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isOpen',
})(({ isOpen, theme }) => ({
  width: isOpen ? 280 : 0,
  opacity: isOpen ? 1 : 0,
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  flexShrink: 0,
  alignSelf: 'stretch',
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

const SidebarInner = styled(Box)(({ theme }) => ({
  width: 280,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  minWidth: 0,
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const SidebarContent = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: 6,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[300],
    borderRadius: 3,
  },
}));

const WidgetsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gridTemplateRows: 'auto auto',
  gap: theme.spacing(2),
  alignItems: 'start',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto',
  },
}));

const ToggleButton = styled(IconButton)(({ theme, side }) => ({
  position: 'fixed',
  top: '50%',
  transform: 'translateY(-50%)',
  [side]: 'calc((100vw - 1800px) / 2 + 32px - 18px)',
  '@media (max-width: 1864px)': {
    [side]: 14,
  },
  zIndex: 100,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  width: 36,
  height: 44,
  borderRadius: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
    '& svg': {
      color: 'white',
    },
  },
  '& svg': {
    color: theme.palette.text.secondary,
  },
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

/**
 * DetailTemplate Component
 *
 * Universal detail page layout matching escrows design
 * Features: Hero card, collapsible sidebars, 2x2 widget grid, activity feed
 */
export const DetailTemplate = ({ config, widgets = [] }) => {
  const { id } = useParams();
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const entityName = config.entity.name;
  const entityNamePlural = config.entity.namePlural;
  const storagePrefix = `${entityName}Detail`;

  // Sidebar collapse states (localStorage persistence)
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(() => {
    return localStorage.getItem(`${storagePrefix}_leftSidebarCollapsed`) === 'true';
  });
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(() => {
    return localStorage.getItem(`${storagePrefix}_rightSidebarCollapsed`) === 'true';
  });

  // Activity feed state
  const [activityFeedOpen, setActivityFeedOpen] = useState(false);

  // Save sidebar states to localStorage
  useEffect(() => {
    localStorage.setItem(`${storagePrefix}_leftSidebarCollapsed`, leftSidebarCollapsed);
  }, [leftSidebarCollapsed, storagePrefix]);

  useEffect(() => {
    localStorage.setItem(`${storagePrefix}_rightSidebarCollapsed`, rightSidebarCollapsed);
  }, [rightSidebarCollapsed, storagePrefix]);

  // Fetch entity data
  useEffect(() => {
    const fetchEntity = async () => {
      try {
        setLoading(true);
        const response = await config.api.getById(id);
        if (response.success) {
          setEntity(response.data);
          setError(null);
        } else {
          setError(response.error?.message || `Failed to load ${entityName}`);
        }
      } catch (err) {
        setError(err.message || `Failed to load ${entityName}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEntity();
    }
  }, [id, config.api, entityName]);

  // Extract Detail API sections from entity (if backend provides them)
  const computed = entity?.computed || {};
  const sidebarLeftData = entity?.sidebar_left || null;
  const sidebarRightData = entity?.sidebar_right || null;
  const widgetsData = entity?.widgets || {};
  const activityFeedData = entity?.activity_feed || null;
  const metadata = entity?.metadata || {};

  // Loading state
  if (loading) {
    return (
      <PageContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </PageContainer>
    );
  }

  // Error state
  if (error || !entity) {
    return (
      <PageContainer>
        <Box maxWidth="600px" margin="0 auto" mt={8}>
          <Alert severity="error">
            {error || `${config.entity.label} not found`}
          </Alert>
        </Box>
      </PageContainer>
    );
  }

  const leftSidebarConfig = config.detail?.leftSidebar;
  const rightSidebarConfig = config.detail?.rightSidebar;
  const widgetsConfig = config.detail?.widgets || widgets;

  return (
    <PageContainer>
      {/* Toggle Buttons */}
      {leftSidebarCollapsed && leftSidebarConfig && (
        <ToggleButton
          side="left"
          onClick={() => setLeftSidebarCollapsed(false)}
          aria-label="Expand left sidebar"
        >
          <ChevronRight size={20} />
        </ToggleButton>
      )}

      {rightSidebarCollapsed && rightSidebarConfig && (
        <ToggleButton
          side="right"
          onClick={() => setRightSidebarCollapsed(false)}
          aria-label="Expand right sidebar"
        >
          <ChevronLeft size={20} />
        </ToggleButton>
      )}

      <LayoutContainer>
        {/* Left Sidebar */}
        {leftSidebarConfig && (
          <Sidebar isOpen={!leftSidebarCollapsed}>
            <SidebarInner>
              <SidebarHeader>
                <Typography variant="subtitle2" fontWeight={700}>
                  {leftSidebarConfig.title || 'Quick Actions'}
                </Typography>
                <IconButton size="small" onClick={() => setLeftSidebarCollapsed(true)}>
                  <CloseIcon size={16} />
                </IconButton>
              </SidebarHeader>
              <SidebarContent>
                <DetailSidebar
                  config={leftSidebarConfig}
                  entity={entity}
                  data={sidebarLeftData}
                  computed={computed}
                  metadata={metadata}
                />
              </SidebarContent>
            </SidebarInner>
          </Sidebar>
        )}

        {/* Main Content */}
        <MainContent>
          {/* Hero Card */}
          <DetailHero
            entity={entity}
            config={config}
            computed={computed}
            metadata={metadata}
          />

          {/* Widgets Grid */}
          <WidgetsGrid>
            {widgetsConfig.map((widget, index) => {
              const WidgetComponent = widget.component;
              // Get widget data from backend (if available)
              const widgetData = widgetsData[widget.id] || null;

              return WidgetComponent ? (
                <WidgetComponent
                  key={widget.id || index}
                  entity={entity}
                  config={config}
                  data={widgetData}
                  computed={computed}
                  metadata={metadata}
                  {...widget.props}
                />
              ) : (
                <Box
                  key={widget.id || index}
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: 2,
                    p: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 200,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {widget.title || 'Widget'} - Coming Soon
                  </Typography>
                </Box>
              );
            })}
          </WidgetsGrid>
        </MainContent>

        {/* Right Sidebar */}
        {rightSidebarConfig && (
          <Sidebar isOpen={!rightSidebarCollapsed}>
            <SidebarInner>
              <SidebarHeader>
                <Typography variant="subtitle2" fontWeight={700}>
                  {rightSidebarConfig.title || 'Smart Context'}
                </Typography>
                <IconButton size="small" onClick={() => setRightSidebarCollapsed(true)}>
                  <CloseIcon size={16} />
                </IconButton>
              </SidebarHeader>
              <SidebarContent>
                <DetailSidebar
                  config={rightSidebarConfig}
                  entity={entity}
                  data={sidebarRightData}
                  computed={computed}
                  metadata={metadata}
                />
              </SidebarContent>
            </SidebarInner>
          </Sidebar>
        )}
      </LayoutContainer>

      {/* Activity Feed Bottom Tab */}
      {config.detail?.activityFeed && (
        <DetailActivityFeed
          entity={entity}
          config={config}
          data={activityFeedData}
          isOpen={activityFeedOpen}
          onToggle={() => setActivityFeedOpen(!activityFeedOpen)}
        />
      )}
    </PageContainer>
  );
};

export default DetailTemplate;

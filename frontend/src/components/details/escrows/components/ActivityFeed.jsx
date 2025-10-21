import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Skeleton
} from '@mui/material';
import {
  DragHandle,
  Timeline as TimelineIcon,
  Person,
  Description,
  AttachMoney,
  Schedule,
  Search,
  FilterList
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import apiInstance from '../../../../services/api.service';

// PHASE 7: Apple Maps-style Draggable Activity Feed
const PEEK_HEIGHT = 80;
const HALF_HEIGHT = 400;
const getFullHeight = () => window.innerHeight - 120;

const BottomSheetContainer = styled(motion.div)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'white',
  borderTopLeftRadius: theme.spacing(3),
  borderTopRightRadius: theme.spacing(3),
  boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
  zIndex: 1200,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const DragHandleBar = styled(Box)(({ theme }) => ({
  width: 40,
  height: 4,
  backgroundColor: theme.palette.grey[300],
  borderRadius: 2,
  margin: theme.spacing(1, 'auto', 0.5),
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing',
  },
}));

const Header = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  cursor: 'pointer',
}));

const ContentArea = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(2),
  '&::-webkit-scrollbar': {
    width: 6,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[300],
    borderRadius: 3,
  },
}));

const ActivityItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const TimeAgo = styled(Typography)(({ theme}) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  whiteSpace: 'nowrap',
}));

const ActivityFeed = ({ escrow, isPanel = false }) => {
  const [height, setHeight] = useState(() => {
    if (isPanel) return null; // Panel mode doesn't need height
    const saved = localStorage.getItem('activityFeedHeight');
    return saved ? parseInt(saved) : PEEK_HEIGHT;
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const y = useMotionValue(0);

  useEffect(() => {
    fetchActivities();
  }, [escrow?.id]);

  useEffect(() => {
    localStorage.setItem('activityFeedHeight', height.toString());
  }, [height]);

  const fetchActivities = async () => {
    if (!escrow?.id) return;

    setLoading(true);
    try {
      const response = await apiInstance.get(`/escrows/${escrow.id}/activity`);
      if (response.data?.success) {
        setActivities(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      // Use mock data if endpoint doesn't exist yet
      setActivities(generateMockActivities());
    } finally {
      setLoading(false);
    }
  };

  const generateMockActivities = () => {
    const now = new Date();
    return [
      {
        id: 1,
        type: 'escrow_opened',
        user: 'Jayden Metz',
        message: 'opened escrow',
        timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        icon: 'person'
      },
      {
        id: 2,
        type: 'timeline_updated',
        user: 'System',
        message: 'scheduled home inspection',
        timestamp: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
        icon: 'schedule'
      },
      {
        id: 3,
        type: 'document_uploaded',
        user: 'Mike Chen',
        message: 'uploaded appraisal report',
        timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
        icon: 'description'
      },
      {
        id: 4,
        type: 'financials_updated',
        user: 'Jayden Metz',
        message: 'updated commission breakdown',
        timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
        icon: 'money'
      },
      {
        id: 5,
        type: 'people_added',
        user: 'Sarah Johnson',
        message: 'added as seller contact',
        timestamp: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
        icon: 'person'
      },
      {
        id: 6,
        type: 'checklist_updated',
        user: 'System',
        message: 'marked "Purchase Agreement Signed" as complete',
        timestamp: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
        icon: 'schedule'
      },
    ];
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'escrow_opened':
      case 'people_added':
        return <Person />;
      case 'timeline_updated':
      case 'checklist_updated':
        return <Schedule />;
      case 'document_uploaded':
        return <Description />;
      case 'financials_updated':
        return <AttachMoney />;
      default:
        return <TimelineIcon />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'escrow_opened':
        return '#4A90E2';
      case 'timeline_updated':
        return '#90E24A';
      case 'document_uploaded':
        return '#E2904A';
      case 'financials_updated':
        return '#10b981';
      case 'people_added':
        return '#9B59B6';
      default:
        return '#95A5A6';
    }
  };

  const handleDragEnd = (event, info) => {
    const { offset } = info;
    const currentHeight = height;
    const newY = currentHeight + offset.y;

    // Determine which snap point to go to
    let targetHeight;
    if (newY < (PEEK_HEIGHT + HALF_HEIGHT) / 2) {
      targetHeight = PEEK_HEIGHT;
    } else if (newY < (HALF_HEIGHT + getFullHeight()) / 2) {
      targetHeight = HALF_HEIGHT;
    } else {
      targetHeight = getFullHeight();
    }

    setHeight(targetHeight);
    animate(y, 0, { type: 'spring', stiffness: 300, damping: 30 });
  };

  const cycleHeight = () => {
    if (height === PEEK_HEIGHT) {
      setHeight(HALF_HEIGHT);
    } else if (height === HALF_HEIGHT) {
      setHeight(getFullHeight());
    } else {
      setHeight(PEEK_HEIGHT);
    }
  };

  const filteredActivities = searchTerm
    ? activities.filter(
        (a) =>
          a.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.message?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : activities;

  const visibleActivities =
    height === PEEK_HEIGHT ? filteredActivities.slice(0, 2) : filteredActivities;

  // BEST PRACTICE: Panel mode for desktop sidebars (no dragging)
  if (isPanel) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search activity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {loading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <Box key={i} mb={2}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mb: 1 }} />
                  <Skeleton width="80%" height={20} />
                  <Skeleton width="60%" height={16} />
                </Box>
              ))}
            </>
          ) : (
            <List dense sx={{ py: 0 }}>
              {filteredActivities.map((activity) => (
                <ActivityItem key={activity.id}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getActivityColor(activity.type), width: 36, height: 36 }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight="600">
                        {activity.user} <span style={{ fontWeight: 400 }}>{activity.message}</span>
                      </Typography>
                    }
                    secondary={<TimeAgo>{activity.timeAgo}</TimeAgo>}
                  />
                </ActivityItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
    );
  }

  // Mobile bottom sheet mode (with dragging)
  return (
    <BottomSheetContainer
      ref={containerRef}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      style={{
        height,
        y,
      }}
      initial={{ y: window.innerHeight }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <DragHandleBar />

      <Header onClick={cycleHeight}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <TimelineIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="700">
              Activity Feed
            </Typography>
            <Chip
              label={activities.length}
              size="small"
              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
            />
          </Box>
          {height === PEEK_HEIGHT && (
            <Typography variant="caption" color="text.secondary">
              Tap to expand ↑
            </Typography>
          )}
        </Box>
      </Header>

      {/* Search & Filter (only in Half/Full states) */}
      {height > PEEK_HEIGHT && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small">
                    <FilterList fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}

      {/* Activities List */}
      <ContentArea>
        {loading ? (
          <List>
            {[1, 2, 3].map((i) => (
              <ActivityItem key={i}>
                <ListItemAvatar>
                  <Skeleton variant="circular" width={40} height={40} />
                </ListItemAvatar>
                <ListItemText
                  primary={<Skeleton width="60%" />}
                  secondary={<Skeleton width="40%" />}
                />
              </ActivityItem>
            ))}
          </List>
        ) : visibleActivities.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
            }}
          >
            <TimelineIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No activity yet
            </Typography>
          </Box>
        ) : (
          <List>
            {visibleActivities.map((activity) => (
              <ActivityItem key={activity.id}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getActivityColor(activity.type), width: 36, height: 36 }}>
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="600">
                        {activity.user}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.message}
                      </Typography>
                    </Box>
                  }
                  secondary={formatTimeAgo(activity.timestamp)}
                />
                <TimeAgo>{formatTimeAgo(activity.timestamp)}</TimeAgo>
              </ActivityItem>
            ))}
          </List>
        )}

        {/* Peek State Hint */}
        {height === PEEK_HEIGHT && !loading && visibleActivities.length > 0 && (
          <Box
            sx={{
              textAlign: 'center',
              pt: 1,
              pb: 2,
              color: 'text.secondary',
            }}
          >
            <Typography variant="caption">
              Swipe up to see {activities.length - 2} more activities
            </Typography>
          </Box>
        )}
      </ContentArea>
    </BottomSheetContainer>
  );
};

export default ActivityFeed;

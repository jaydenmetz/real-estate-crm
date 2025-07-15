import React, { useState, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  IconButton,
  Collapse,
  Fade,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Skeleton,
  Popper,
  Paper,
  ClickAwayListener,
  Grow
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess,
  TrendingUp,
  TrendingDown,
  OpenInNew,
  InfoOutlined
} from '@mui/icons-material';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = 'primary', 
  trend, 
  subtitle,
  onClick,
  expandable = false,
  details = null,
  loading = false,
  actionLabel = 'View Details',
  href,
  hoverContent,
  onRequestFullView
}) => {
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const cardRef = useRef(null);

  const handleMouseEnter = (event) => {
    setAnchorEl(event.currentTarget);
    setHovering(true);
  };

  const handleMouseLeave = () => {
    setHovering(false);
    // Small delay to prevent flicker
    setTimeout(() => {
      if (!hovering) {
        setAnchorEl(null);
      }
    }, 100);
  };

  const handleClick = () => {
    if (onRequestFullView) {
      onRequestFullView();
    } else if (onClick) {
      onClick();
    } else if (expandable && details) {
      setExpanded(!expanded);
    }
  };

  const handleCardClick = (e) => {
    // Don't trigger card click if clicking on expand button
    if (e.target.closest('.expand-button')) return;
    handleClick();
  };

  const open = Boolean(anchorEl) && hovering && (hoverContent || details);

  return (
    <>
    <Card
      sx={{
        height: expandable && expanded ? 'auto' : '100%',
        cursor: (onClick || href || (expandable && details)) ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: (onClick || href || (expandable && details)) ? 'translateY(-4px)' : 'none',
          boxShadow: (onClick || href || (expandable && details)) ? 6 : 1,
          '& .hover-overlay': {
            opacity: 1
          }
        }
      }}
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      {/* Hover Overlay Effect */}
      {(onClick || href || (expandable && details)) && (
        <Box
          className="hover-overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${color}.light 0%, ${color}.main 50%, ${color}.dark 100%)`,
            opacity: 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
      
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box flex={1}>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={120} height={40} />
            ) : (
              <Fade in={true} timeout={300}>
                <Typography variant="h4" component="h2">
                  {value}
                </Typography>
              </Fade>
            )}
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                {trend > 0 ? (
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                )}
                <Typography 
                  variant="body2" 
                  color={trend > 0 ? 'success.main' : 'error.main'}
                >
                  {trend > 0 ? '+' : ''}{trend}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: `${color}.light`,
                  color: `${color}.main`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  ...(hovering && {
                    transform: 'scale(1.1)',
                    backgroundColor: `${color}.main`,
                    color: 'white',
                  })
                }}
              >
                {icon}
              </Box>
            )}
            {expandable && details && (
              <IconButton
                className="expand-button"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                sx={{
                  transition: 'transform 0.3s ease',
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              >
                <ExpandMore />
              </IconButton>
            )}
          </Box>
        </Box>
        
        {/* Expandable Details Section */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />
          {details && (
            <Box>
              {typeof details === 'string' ? (
                <Typography variant="body2" color="text.secondary">
                  {details}
                </Typography>
              ) : (
                details
              )}
              {(onClick || href) && (
                <Button
                  size="small"
                  startIcon={<OpenInNew />}
                  sx={{ mt: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (href) {
                      window.open(href, '_blank');
                    } else if (onClick) {
                      onClick();
                    }
                  }}
                >
                  {actionLabel}
                </Button>
              )}
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
    
    {/* Hover Popup */}
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="top"
      transition
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ]}
      sx={{ zIndex: 1300 }}
    >
      {({ TransitionProps }) => (
        <Grow {...TransitionProps} timeout={200}>
          <Paper
            sx={{
              p: 2,
              maxWidth: 300,
              boxShadow: 4,
              border: '1px solid',
              borderColor: 'divider',
            }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={handleMouseLeave}
          >
            {hoverContent ? (
              hoverContent
            ) : (
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold" color={`${color}.main`}>
                  {title}
                </Typography>
                {typeof details === 'string' ? (
                  <Typography variant="body2" color="text.secondary">
                    {details}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Click to view detailed breakdown
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }} color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grow>
      )}
    </Popper>
    </>
  );
};

export default StatsCard;
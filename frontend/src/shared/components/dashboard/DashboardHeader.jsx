import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  Stack,
  Skeleton
} from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions = [],
  loading = false
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="text" width={300} height={20} />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 1 }}
        >
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
              href={crumb.href}
              onClick={(e) => {
                e.preventDefault();
                if (crumb.onClick) crumb.onClick();
                else if (crumb.href) navigate(crumb.href);
              }}
              sx={{
                textDecoration: 'none',
                cursor: crumb.href ? 'pointer' : 'default'
              }}
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}

      {/* Title and Actions */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Header Actions */}
        {actions && actions.length > 0 && (
          <Stack direction="row" spacing={2}>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outlined'}
                color={action.color || 'primary'}
                startIcon={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
                size={action.size || 'medium'}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default DashboardHeader;

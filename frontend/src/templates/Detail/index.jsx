import React from 'react';
import {
  Container,
  Breadcrumbs,
  Link,
  Typography,
  Skeleton,
  Alert,
  Button,
  Box,
} from '@mui/material';
import { Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DetailHero } from './components/DetailHero';
import { DetailTabs } from './components/DetailTabs';
import { useDetailData } from './hooks/useDetailData';

/**
 * DetailTemplate Component
 *
 * Main orchestrator for detail pages
 * Renders hero, breadcrumbs, tabs based on config
 *
 * @param {Object} config - Entity configuration object
 * @param {React.ReactNode} children - Additional custom content
 */
export const DetailTemplate = ({ config, children }) => {
  const navigate = useNavigate();
  const {
    entity,
    isLoading,
    isError,
    error,
    navigateToList,
  } = useDetailData(config);

  const entityLabel = config.entity.label;
  const entityLabelPlural = config.entity.labelPlural;
  const entityNamePlural = config.entity.namePlural;

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={300} sx={{ mb: 3, borderRadius: 3 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      </Container>
    );
  }

  // Error state
  if (isError) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={navigateToList}>
              Back to {entityLabelPlural}
            </Button>
          }
        >
          Failed to load {entityLabel.toLowerCase()} details. {error?.message || 'Please try again later.'}
        </Alert>
      </Container>
    );
  }

  // Get name for breadcrumbs
  const entityName = entity?.[config.detail?.hero?.nameField || 'name'] || entityLabel;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      {config.detail?.showBreadcrumbs !== false && (
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/dashboard')}
            sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
          >
            <Home sx={{ mr: 0.5, fontSize: 20 }} />
            Dashboard
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={navigateToList}
            sx={{ textDecoration: 'none', color: 'inherit' }}
          >
            {entityLabelPlural}
          </Link>
          <Typography color="primary">{entityName}</Typography>
        </Breadcrumbs>
      )}

      {/* Hero Section */}
      {config.detail?.hero && (
        <DetailHero entity={entity} config={config} />
      )}

      {/* Tabs or Custom Content */}
      {config.detail?.tabs && config.detail.tabs.length > 0 ? (
        <DetailTabs entity={entity} config={config}>
          {children}
        </DetailTabs>
      ) : (
        children
      )}
    </Container>
  );
};

export default DetailTemplate;

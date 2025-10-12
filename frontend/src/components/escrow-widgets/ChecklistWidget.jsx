import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import { CheckCircle, ExpandMore } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const WidgetCard = styled(Card)(({ theme }) => ({
  height: '100%',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
  }
}));

const ChecklistWidget = ({ viewMode = 'medium', data = {}, onToggleItem }) => {
  // Calculate overall progress
  const calculateProgress = () => {
    let totalItems = 0;
    let completedItems = 0;

    Object.keys(data).forEach(category => {
      if (typeof data[category] === 'object') {
        Object.entries(data[category]).forEach(([key, value]) => {
          if (typeof value === 'boolean') {
            totalItems++;
            if (value) completedItems++;
          }
        });
      }
    });

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const progress = calculateProgress();

  // Format checklist categories
  const formatCategoryName = (category) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format checklist item names
  const formatItemName = (item) => {
    return item
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get checklist sections
  const getChecklistSections = () => {
    const sections = [];

    Object.keys(data).forEach(category => {
      if (typeof data[category] === 'object') {
        const items = Object.entries(data[category])
          .filter(([key, value]) => typeof value === 'boolean')
          .map(([key, value]) => ({ key, checked: value }));

        if (items.length > 0) {
          const completed = items.filter(item => item.checked).length;
          sections.push({
            name: formatCategoryName(category),
            category,
            items,
            completed,
            total: items.length,
            progress: Math.round((completed / items.length) * 100)
          });
        }
      }
    });

    return sections;
  };

  const sections = getChecklistSections();

  const handleToggle = (category, itemKey, currentValue) => {
    if (onToggleItem) {
      onToggleItem(category, itemKey, !currentValue);
    }
  };

  return (
    <WidgetCard>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CheckCircle sx={{ color: '#764ba2' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Checklists
          </Typography>
        </Box>

        {viewMode === 'small' && (
          <Box>
            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#764ba2',
                    borderRadius: 4
                  }
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'center' }}>
              {progress}% Complete
            </Typography>
          </Box>
        )}

        {viewMode === 'medium' && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Overall Progress
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#764ba2',
                    borderRadius: 5
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {sections.map((section, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 1.5,
                    bgcolor: '#f8f9fa',
                    borderRadius: 1.5
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {section.name}
                    </Typography>
                    <Chip
                      label={`${section.completed}/${section.total}`}
                      size="small"
                      sx={{
                        height: 20,
                        bgcolor: section.progress === 100 ? '#4caf50' : '#e0e0e0',
                        color: section.progress === 100 ? 'white' : 'text.primary'
                      }}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={section.progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: section.progress === 100 ? '#4caf50' : '#764ba2',
                        borderRadius: 3
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {viewMode === 'large' && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Overall Progress
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#764ba2' }}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#764ba2',
                    borderRadius: 6
                  }
                }}
              />
            </Box>

            {sections.map((section, index) => (
              <Accordion
                key={index}
                defaultExpanded={index === 0}
                sx={{
                  mb: 1,
                  boxShadow: 'none',
                  border: '1px solid #e0e0e0',
                  '&:before': { display: 'none' },
                  borderRadius: '8px !important'
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, pr: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
                      {section.name}
                    </Typography>
                    <Chip
                      label={`${section.completed}/${section.total}`}
                      size="small"
                      sx={{
                        bgcolor: section.progress === 100 ? '#4caf50' : '#764ba2',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {section.items.map((item, itemIndex) => (
                      <FormControlLabel
                        key={itemIndex}
                        control={
                          <Checkbox
                            checked={item.checked}
                            onChange={() => handleToggle(section.category, item.key, item.checked)}
                            sx={{
                              color: '#764ba2',
                              '&.Mui-checked': {
                                color: '#4caf50'
                              }
                            }}
                          />
                        }
                        label={
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: item.checked ? 'line-through' : 'none',
                              color: item.checked ? 'text.secondary' : 'text.primary'
                            }}
                          >
                            {formatItemName(item.key)}
                          </Typography>
                        }
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </CardContent>
    </WidgetCard>
  );
};

export default ChecklistWidget;

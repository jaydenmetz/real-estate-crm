import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  timelineItemClasses
} from '@mui/material';
import { Schedule, CheckCircle, Event } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format, parseISO, isPast, isFuture } from 'date-fns';

const WidgetCard = styled(Card)(({ theme }) => ({
  height: '100%',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
  }
}));

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch (error) {
    return dateString;
  }
};

const isDatePast = (dateString) => {
  if (!dateString) return false;
  try {
    return isPast(parseISO(dateString));
  } catch (error) {
    return false;
  }
};

const TimelineWidget = ({ viewMode = 'medium', data = {} }) => {
  const openingDate = data?.opening_date || data?.openingDate;
  const inspectionDate = data?.inspection_date || data?.inspectionDate;
  const appraisalDate = data?.appraisal_date || data?.appraisalDate;
  const contingencyDate = data?.contingency_date || data?.contingencyDate;
  const closingDate = data?.closing_date || data?.closingDate;

  const timelineEvents = [
    { label: 'Opening Date', date: openingDate, icon: Event },
    { label: 'Inspection Date', date: inspectionDate, icon: Schedule },
    { label: 'Appraisal Date', date: appraisalDate, icon: Schedule },
    { label: 'Contingency Removal', date: contingencyDate, icon: Schedule },
    { label: 'Closing Date', date: closingDate, icon: CheckCircle }
  ].filter(event => event.date);

  const nextMilestone = timelineEvents.find(event => isFuture(parseISO(event.date)));

  const calculateDaysToClose = () => {
    if (!closingDate) return null;
    const today = new Date();
    const close = new Date(closingDate);
    const diffTime = close - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysToClose = calculateDaysToClose();

  return (
    <WidgetCard>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Schedule sx={{ color: '#764ba2' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Timeline
          </Typography>
        </Box>

        {viewMode === 'small' && (
          <Box>
            {nextMilestone && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Next Milestone
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {nextMilestone.label}
                </Typography>
                <Typography variant="body2" color="primary">
                  {formatDate(nextMilestone.date)}
                </Typography>
              </Box>
            )}
            {daysToClose !== null && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Days to Close
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: daysToClose < 30 ? '#ff9800' : '#764ba2' }}>
                  {daysToClose}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {viewMode === 'medium' && (
          <Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {openingDate && (
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="caption" color="text.secondary">
                    Opening Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDate(openingDate)}
                  </Typography>
                  {isDatePast(openingDate) && (
                    <Chip label="Completed" size="small" color="success" sx={{ mt: 0.5, height: 20 }} />
                  )}
                </Box>
              )}
              {inspectionDate && (
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="caption" color="text.secondary">
                    Inspection
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDate(inspectionDate)}
                  </Typography>
                  {isDatePast(inspectionDate) && (
                    <Chip label="Completed" size="small" color="success" sx={{ mt: 0.5, height: 20 }} />
                  )}
                </Box>
              )}
              {contingencyDate && (
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="caption" color="text.secondary">
                    Contingency Removal
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDate(contingencyDate)}
                  </Typography>
                  {isDatePast(contingencyDate) && (
                    <Chip label="Completed" size="small" color="success" sx={{ mt: 0.5, height: 20 }} />
                  )}
                </Box>
              )}
              {closingDate && (
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="caption" color="text.secondary">
                    Closing Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#764ba2' }}>
                    {formatDate(closingDate)}
                  </Typography>
                  {daysToClose !== null && (
                    <Typography variant="caption" color="text.secondary">
                      ({daysToClose} days)
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {viewMode === 'large' && (
          <Box>
            <Timeline
              sx={{
                [`& .${timelineItemClasses.root}:before`]: {
                  flex: 0,
                  padding: 0
                }
              }}
            >
              {timelineEvents.map((event, index) => {
                const isPastDate = isDatePast(event.date);
                const IconComponent = event.icon;

                return (
                  <TimelineItem key={index}>
                    <TimelineSeparator>
                      <TimelineDot
                        color={isPastDate ? 'success' : 'grey'}
                        sx={{
                          boxShadow: isPastDate ? '0 0 0 4px rgba(76, 175, 80, 0.1)' : 'none'
                        }}
                      >
                        <IconComponent sx={{ fontSize: 18 }} />
                      </TimelineDot>
                      {index < timelineEvents.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {event.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(event.date)}
                      </Typography>
                      {isPastDate && (
                        <Chip
                          label="Completed"
                          size="small"
                          color="success"
                          sx={{ mt: 0.5, height: 20 }}
                        />
                      )}
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </Timeline>

            {daysToClose !== null && (
              <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Days Until Closing
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: daysToClose < 30 ? '#ff9800' : '#764ba2' }}>
                  {daysToClose}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </WidgetCard>
  );
};

export default TimelineWidget;

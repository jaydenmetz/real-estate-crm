import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart } from '@mui/icons-material';

class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chart rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: 'text.secondary'
          }}
        >
          <BarChart sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography variant="body2">Unable to load chart</Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;
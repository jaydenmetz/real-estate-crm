import React, { useState } from 'react';
import {
  Paper,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import * as MuiIcons from '@mui/icons-material';

const TabPanel = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`detail-tabpanel-${index}`}
      aria-labelledby={`detail-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

/**
 * DetailTabs Component
 *
 * Renders tab navigation and tab content based on config
 */
export const DetailTabs = ({ entity, config, children }) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabsConfig = config.detail?.tabs || [];

  if (!tabsConfig.length) return children;

  // Get icon component
  const getIcon = (iconName) => {
    if (!iconName) return null;
    const Icon = MuiIcons[iconName];
    return Icon ? <Icon /> : null;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabsConfig.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={getIcon(tab.icon)}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {tabsConfig.map((tab, index) => (
        <TabPanel key={index} value={activeTab} index={index}>
          {tab.component ? (
            React.createElement(tab.component, { entity, config })
          ) : (
            tab.content || null
          )}
        </TabPanel>
      ))}
    </>
  );
};

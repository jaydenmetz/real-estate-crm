import React, { useState } from 'react';
import { DetailTemplate } from '../../../templates/Detail';
import { leadsConfig } from '../../../config/entities/leads.config';

/**
 * Leads Detail Page
 *
 * Uses universal DetailTemplate with leads-specific config
 * Manages modal state for widget interactions
 *
 * Previous implementation: 733 lines
 * Current implementation: ~70 lines (90% reduction)
 */
const LeadDetail = () => {
  // Modal states
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [qualificationModalOpen, setQualificationModalOpen] = useState(false);
  const [engagementModalOpen, setEngagementModalOpen] = useState(false);
  const [currentEntity, setCurrentEntity] = useState(null);

  // Widget click handlers
  const handleWidgetClick = (widgetId) => {
    switch (widgetId) {
      case 'contact':
        setContactModalOpen(true);
        break;
      case 'qualification':
        setQualificationModalOpen(true);
        break;
      case 'engagement':
        setEngagementModalOpen(true);
        break;
      default:
        break;
    }
  };

  // Enhanced config with onClick handlers
  const enhancedConfig = {
    ...leadsConfig,
    detail: {
      ...leadsConfig.detail,
      widgets: leadsConfig.detail.widgets.map(widget => ({
        ...widget,
        props: {
          ...widget.props,
          onClick: () => handleWidgetClick(widget.id)
        }
      }))
    }
  };

  return (
    <>
      <DetailTemplate
        config={enhancedConfig}
        onEntityLoad={setCurrentEntity}
      />

      {/* Contact Modal - Placeholder for future implementation */}
      {/* <ContactModal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        lead={currentEntity}
      /> */}

      {/* Qualification Modal - Placeholder for future implementation */}
      {/* <QualificationModal
        open={qualificationModalOpen}
        onClose={() => setQualificationModalOpen(false)}
        lead={currentEntity}
      /> */}

      {/* Engagement Modal - Placeholder for future implementation */}
      {/* <EngagementModal
        open={engagementModalOpen}
        onClose={() => setEngagementModalOpen(false)}
        lead={currentEntity}
      /> */}
    </>
  );
};

export default LeadDetail;

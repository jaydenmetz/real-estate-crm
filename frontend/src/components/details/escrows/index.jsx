import React, { useState } from 'react';
import { DetailTemplate } from '../../../templates/Detail';
import { escrowsConfig } from '../../../config/entities/escrows.config';

// Import modals
import FinancialsModal from './modals/FinancialsModal';
import TimelineModal from './modals/TimelineModal';
import PeopleModal from './modals/PeopleModal';
import ChecklistsModal from './modals/ChecklistsModal';

/**
 * Escrow Detail Page with Modal Support
 *
 * Uses DetailTemplate with escrowsConfig for rendering
 * Adds modal support for widgets that need detailed views
 *
 * MIGRATED: October 30, 2025
 * - Reduced from 420 lines to ~70 lines (with modal handlers)
 * - Uses universal DetailTemplate like clients
 * - Backend Detail API data flows automatically
 * - Widgets configured via escrows.config.js
 * - Modals restored for detailed editing
 */
const EscrowDetail = () => {
  // Modal states
  const [financialsModalOpen, setFinancialsModalOpen] = useState(false);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [peopleModalOpen, setPeopleModalOpen] = useState(false);
  const [checklistsModalOpen, setChecklistsModalOpen] = useState(false);
  const [currentEntity, setCurrentEntity] = useState(null);

  // Widget click handlers
  const handleWidgetClick = (widgetId) => {
    switch (widgetId) {
      case 'financials':
        setFinancialsModalOpen(true);
        break;
      case 'timeline':
        setTimelineModalOpen(true);
        break;
      case 'people':
        setPeopleModalOpen(true);
        break;
      case 'checklists':
        setChecklistsModalOpen(true);
        break;
      default:
        break;
    }
  };

  // Update handler for modals
  const handleUpdate = () => {
    // Trigger refetch
    window.location.reload();
  };

  // Enhanced config with onClick handlers
  const enhancedConfig = {
    ...escrowsConfig,
    detail: {
      ...escrowsConfig.detail,
      widgets: escrowsConfig.detail.widgets.map(widget => ({
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

      {/* Modals */}
      {currentEntity && (
        <>
          <FinancialsModal
            open={financialsModalOpen}
            onClose={() => setFinancialsModalOpen(false)}
            escrow={currentEntity}
            onUpdate={handleUpdate}
          />

          <TimelineModal
            open={timelineModalOpen}
            onClose={() => setTimelineModalOpen(false)}
            escrow={currentEntity}
            onUpdate={handleUpdate}
          />

          <PeopleModal
            open={peopleModalOpen}
            onClose={() => setPeopleModalOpen(false)}
            escrow={currentEntity}
            onUpdate={handleUpdate}
          />

          <ChecklistsModal
            open={checklistsModalOpen}
            onClose={() => setChecklistsModalOpen(false)}
            escrow={currentEntity}
            onUpdate={handleUpdate}
          />
        </>
      )}
    </>
  );
};

export default EscrowDetail;

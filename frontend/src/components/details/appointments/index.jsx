import React, { useState } from 'react';
import { DetailTemplate } from '../../../templates/Detail';
import { appointmentsConfig } from '../../../config/entities/appointments.config';

/**
 * Appointments Detail Page
 *
 * Uses universal DetailTemplate with appointments-specific config
 * Manages modal state for widget interactions
 *
 * Previous implementation: 1,488 lines
 * Current implementation: ~70 lines (95% reduction)
 */
const AppointmentDetail = () => {
  // Modal states
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [currentEntity, setCurrentEntity] = useState(null);

  // Widget click handlers
  const handleWidgetClick = (widgetId) => {
    switch (widgetId) {
      case 'location':
        setLocationModalOpen(true);
        break;
      case 'participants':
        setParticipantsModalOpen(true);
        break;
      case 'notes':
        setNotesModalOpen(true);
        break;
      default:
        break;
    }
  };

  // Enhanced config with onClick handlers
  const enhancedConfig = {
    ...appointmentsConfig,
    detail: {
      ...appointmentsConfig.detail,
      widgets: appointmentsConfig.detail.widgets.map(widget => ({
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

      {/* Location Modal - Placeholder for future implementation */}
      {/* <LocationModal
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        appointment={currentEntity}
      /> */}

      {/* Participants Modal - Placeholder for future implementation */}
      {/* <ParticipantsModal
        open={participantsModalOpen}
        onClose={() => setParticipantsModalOpen(false)}
        appointment={currentEntity}
      /> */}

      {/* Notes Modal - Placeholder for future implementation */}
      {/* <NotesModal
        open={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        appointment={currentEntity}
      /> */}
    </>
  );
};

export default AppointmentDetail;

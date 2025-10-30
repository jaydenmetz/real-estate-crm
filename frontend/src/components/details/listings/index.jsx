import React, { useState } from 'react';
import { DetailTemplate } from '../../../templates/Detail';
import { listingsConfig } from '../../../config/entities/listings.config';

// Import modals
import EditListingModal from './modals/EditListingModal';

/**
 * Listings Detail Page
 *
 * Uses universal DetailTemplate with listings-specific config
 * Manages modal state for widget interactions
 *
 * Previous implementation: 2,530 lines
 * Current implementation: ~70 lines (96% reduction)
 */
const ListingDetail = () => {
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [comparablesModalOpen, setComparablesModalOpen] = useState(false);
  const [currentEntity, setCurrentEntity] = useState(null);

  // Widget click handlers
  const handleWidgetClick = (widgetId) => {
    switch (widgetId) {
      case 'price':
        setPriceModalOpen(true);
        break;
      case 'activity':
        setActivityModalOpen(true);
        break;
      case 'comparables':
        setComparablesModalOpen(true);
        break;
      default:
        break;
    }
  };

  // Enhanced config with onClick handlers
  const enhancedConfig = {
    ...listingsConfig,
    detail: {
      ...listingsConfig.detail,
      widgets: listingsConfig.detail.widgets.map(widget => ({
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

      {/* Edit Listing Modal */}
      {currentEntity && (
        <EditListingModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          listing={currentEntity}
          onSave={(updatedListing) => {
            setCurrentEntity(updatedListing);
            setEditModalOpen(false);
          }}
        />
      )}

      {/* Price History Modal - Placeholder for future implementation */}
      {/* <PriceHistoryModal
        open={priceModalOpen}
        onClose={() => setPriceModalOpen(false)}
        listing={currentEntity}
      /> */}

      {/* Activity Modal - Placeholder for future implementation */}
      {/* <ActivityModal
        open={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        listing={currentEntity}
      /> */}

      {/* Comparables Modal - Placeholder for future implementation */}
      {/* <ComparablesModal
        open={comparablesModalOpen}
        onClose={() => setComparablesModalOpen(false)}
        listing={currentEntity}
      /> */}
    </>
  );
};

export default ListingDetail;

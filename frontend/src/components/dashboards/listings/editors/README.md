# Listings Editors

This folder will contain listing-specific inline editors:

- `EditListingPrice.jsx` - Edit listing price (uses EditableCurrencyField template)
- `EditListingDates.jsx` - Edit beginning/expiration dates (uses EditableDateField template)
- `EditPropertyAddress.jsx` - Edit property address (uses EditableTextField template)
- `EditCommissionAmount.jsx` - Edit commission rate/amount (uses EditableNumberField template)
- `EditListingStatus.jsx` - Edit listing status (Active/Closed/Expired)

All editors will follow the same pattern as escrows editors, using the common editor templates from `frontend/src/components/common/editors/`.

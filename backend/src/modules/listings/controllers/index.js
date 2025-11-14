const crudController = require('./crud.controller');
const marketingController = require('./marketing.controller');
const analyticsController = require('./analytics.controller');

module.exports = {
  // CRUD operations (8 methods)
  getListings: crudController.getListings,
  getListing: crudController.getListing,
  createListing: crudController.createListing,
  updateListing: crudController.updateListing,
  updateStatus: crudController.updateStatus,
  archiveListing: crudController.archiveListing,
  deleteListing: crudController.deleteListing,
  batchDeleteListings: crudController.batchDeleteListings,

  // Marketing operations (3 methods)
  recordPriceChange: marketingController.recordPriceChange,
  logShowing: marketingController.logShowing,
  updateMarketingChecklist: marketingController.updateMarketingChecklist,

  // Analytics operations (2 methods)
  getListingAnalytics: analyticsController.getListingAnalytics,
  trackAnalytics: analyticsController.trackAnalytics,
};

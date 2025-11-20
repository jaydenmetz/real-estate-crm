const crudController = require('./crud.controller');
const marketingController = require('./sub-resources/marketing.controller');
const analyticsController = require('./sub-resources/analytics.controller');

module.exports = {
  // CRUD operations (9 methods)
  getListings: crudController.getListings,
  getListing: crudController.getListing,
  createListing: crudController.createListing,
  updateListing: crudController.updateListing,
  updateStatus: crudController.updateStatus,
  archiveListing: crudController.archiveListing,
  restoreListing: crudController.restoreListing,
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

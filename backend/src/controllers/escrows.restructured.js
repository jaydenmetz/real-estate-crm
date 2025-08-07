// Restructured response builder for escrow endpoint
// This file contains the new structure for the escrow API response

function buildRestructuredEscrowResponse(escrow) {
  // Parse checklists if they're stringified
  let checklists = escrow.checklists || {};
  if (typeof checklists === 'string') {
    try {
      checklists = JSON.parse(checklists);
    } catch (e) {
      checklists = {};
    }
  }

  // Parse people if stringified
  let people = escrow.people || {};
  if (typeof people === 'string') {
    try {
      people = JSON.parse(people);
    } catch (e) {
      people = {};
    }
  }

  // Parse timeline if stringified
  let timeline = escrow.timeline || {};
  if (typeof timeline === 'string') {
    try {
      timeline = JSON.parse(timeline);
    } catch (e) {
      timeline = {};
    }
  }

  // Parse financials if stringified
  let financials = escrow.financials || {};
  if (typeof financials === 'string') {
    try {
      financials = JSON.parse(financials);
    } catch (e) {
      financials = {};
    }
  }

  // Calculate days to close
  const daysToClose = escrow.closing_date ? 
    Math.floor((new Date(escrow.closing_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  // Calculate checklist progress
  let totalItems = 0;
  let completedItems = 0;
  
  Object.values(checklists).forEach(section => {
    if (typeof section === 'object' && section !== null) {
      Object.values(section).forEach(value => {
        totalItems++;
        if (value === true) completedItems++;
      });
    }
  });
  
  const checklistProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Build the restructured response
  return {
    // Core escrow details
    details: {
      id: escrow.id,
      escrowNumber: escrow.display_id,
      propertyAddress: escrow.property_address,
      propertyImage: escrow.property_image_url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      zillowUrl: escrow.zillow_url || null,
      escrowStatus: escrow.escrow_status,
      purchasePrice: parseFloat(escrow.purchase_price) || 0,
      myCommission: parseFloat(escrow.my_commission) || 0,
      scheduledCoeDate: escrow.closing_date || null,
      daysToClose: daysToClose,
      checklistProgress: checklistProgress,
      lastActivity: escrow.updated_at || escrow.created_at || null,
      upcomingDeadlines: 2,
      escrowCompany: escrow.escrow_company || null,
      escrowOfficerName: escrow.escrow_officer_name || null,
      escrowOfficerEmail: escrow.escrow_officer_email || null,
      escrowOfficerPhone: escrow.escrow_officer_phone || null,
      titleCompany: escrow.title_company || null,
      transactionType: escrow.transaction_type || 'Purchase',
      leadSource: escrow.lead_source || null,
      createdAt: escrow.created_at,
      updatedAt: escrow.updated_at
    },

    // Property details (renamed from propertyDetails)
    'property-details': {
      address: escrow.property_address || null,
      city: escrow.city || null,
      state: escrow.state || 'CA',
      zipCode: escrow.zip_code || null,
      county: escrow.county || null,
      propertyType: escrow.property_type || 'Single Family',
      bedrooms: escrow.bedrooms || null,
      bathrooms: escrow.bathrooms || null,
      squareFeet: escrow.square_feet || null,
      lotSizeSqft: escrow.lot_size_sqft || null,
      yearBuilt: escrow.year_built || null,
      stories: escrow.stories || null,
      garageSpaces: escrow.garage_spaces || null,
      pool: escrow.pool || false,
      spa: escrow.spa || false,
      viewType: escrow.view_type || null,
      architecturalStyle: escrow.architectural_style || null,
      propertyCondition: escrow.property_condition || null,
      zoning: escrow.zoning || null,
      subdivision: escrow.subdivision || null,
      crossStreets: escrow.cross_streets || null,
      latitude: escrow.latitude || null,
      longitude: escrow.longitude || null,
      apn: escrow.apn || null,
      mlsNumber: escrow.mls_number || null,
      hoaFee: escrow.hoa_fee || null,
      hoaFrequency: escrow.hoa_frequency || null,
      hoaName: escrow.hoa_name || null,
      gatedCommunity: escrow.gated_community || false,
      seniorCommunity: escrow.senior_community || false,
      listPrice: escrow.list_price || null,
      listDate: escrow.list_date || null,
      daysOnMarket: escrow.days_on_market || null,
      previousListPrice: escrow.previous_list_price || null,
      originalListPrice: escrow.original_list_price || null,
      pricePerSqft: escrow.square_feet && escrow.purchase_price ? 
        Math.round(parseFloat(escrow.purchase_price) / escrow.square_feet) : null
    },

    // People - simplified to contact references with roles
    people: {
      buyer: people.buyer && (people.buyer.id || people.buyer.name) ? { 
        contactId: people.buyer.id || null, 
        role: 'buyer', 
        name: people.buyer.name || null 
      } : null,
      buyerAgent: people.buyerAgent && (people.buyerAgent.id || people.buyerAgent.name) ? { 
        contactId: people.buyerAgent.id || null, 
        role: 'buyerAgent', 
        name: people.buyerAgent.name || null 
      } : null,
      seller: people.seller && (people.seller.id || people.seller.name) ? { 
        contactId: people.seller.id || null, 
        role: 'seller', 
        name: people.seller.name || null 
      } : null,
      sellerAgent: people.sellerAgent && (people.sellerAgent.id || people.sellerAgent.name) ? { 
        contactId: people.sellerAgent.id || null, 
        role: 'sellerAgent', 
        name: people.sellerAgent.name || null 
      } : null,
      escrowOfficer: (people.escrowOfficer && (people.escrowOfficer.id || people.escrowOfficer.name)) || escrow.escrow_officer_name ? { 
        contactId: people.escrowOfficer?.id || null, 
        role: 'escrowOfficer', 
        name: people.escrowOfficer?.name || escrow.escrow_officer_name || null 
      } : null,
      titleOfficer: people.titleOfficer && (people.titleOfficer.id || people.titleOfficer.name) ? { 
        contactId: people.titleOfficer.id || null, 
        role: 'titleOfficer', 
        name: people.titleOfficer.name || null 
      } : null,
      loanOfficer: (people.loanOfficer && (people.loanOfficer.id || people.loanOfficer.name)) || escrow.loan_officer_name ? { 
        contactId: people.loanOfficer?.id || null, 
        role: 'loanOfficer', 
        name: people.loanOfficer?.name || escrow.loan_officer_name || null 
      } : null,
      homeInspector: people.homeInspector && (people.homeInspector.id || people.homeInspector.name) ? { 
        contactId: people.homeInspector.id || null, 
        role: 'homeInspector', 
        name: people.homeInspector.name || null 
      } : null,
      appraiser: people.appraiser && (people.appraiser.id || people.appraiser.name) ? { 
        contactId: people.appraiser.id || null, 
        role: 'appraiser', 
        name: people.appraiser.name || null 
      } : null,
      transactionCoordinator: (people.transactionCoordinator && (people.transactionCoordinator.id || people.transactionCoordinator.name)) || escrow.transaction_coordinator ? { 
        contactId: people.transactionCoordinator?.id || null, 
        role: 'transactionCoordinator', 
        name: people.transactionCoordinator?.name || escrow.transaction_coordinator || null 
      } : null,
    },

    // Cleaned up timeline
    timeline: {
      acceptanceDate: escrow.acceptance_date || timeline.acceptanceDate || null,
      emdDate: escrow.emd_date || timeline.emdDate || null,
      sellerDisclosuresDueDate: escrow.seller_disclosures_due_date || timeline.sellerDisclosuresDueDate || null,
      homeInspectionDate: escrow.physical_inspection_date || timeline.physicalInspectionDate || timeline.homeInspectionDate || null,
      termiteInspectionDate: escrow.termite_inspection_date || timeline.termiteInspectionDate || null,
      roofInspectionDate: escrow.roof_inspection_date || timeline.roofInspectionDate || null,
      sewerInspectionDate: escrow.sewer_inspection_date || timeline.sewerInspectionDate || null,
      poolSpaInspectionDate: escrow.pool_spa_inspection_date || timeline.poolSpaInspectionDate || null,
      chimneyInspectionDate: escrow.chimney_inspection_date || timeline.chimneyInspectionDate || null,
      inspectionPeriodEndDate: escrow.inspection_period_end_date || timeline.inspectionPeriodEndDate || null,
      loanApplicationDate: escrow.loan_application_date || timeline.loanApplicationDate || null,
      appraisalOrderedDate: escrow.appraisal_ordered_date || timeline.appraisalOrderedDate || null,
      appraisalCompletedDate: escrow.appraisal_completed_date || timeline.appraisalCompletedDate || null,
      insuranceOrderedDate: escrow.insurance_ordered_date || timeline.insuranceOrderedDate || null,
      inspectionContingencyRemovalDate: escrow.inspection_contingency_removal_date || timeline.inspectionContingencyRemovalDate || null,
      appraisalContingencyRemovalDate: escrow.appraisal_contingency_removal_date || timeline.appraisalContingencyRemovalDate || null,
      loanContingencyRemovalDate: escrow.loan_contingency_removal_date || timeline.loanContingencyRemovalDate || null,
      allContingenciesRemovalDate: escrow.all_contingencies_removal_date || timeline.allContingenciesRemovalDate || null,
      repairsCompletionDate: escrow.repairs_completion_date || timeline.repairsCompletionDate || null,
      termiteCompletionDate: escrow.termite_completion_date || timeline.termiteCompletionDate || null,
      smokeAlarmInstallationDate: escrow.smoke_alarm_installation_date || timeline.smokeAlarmInstallationDate || null,
      loanApprovalDate: escrow.loan_approval_date || timeline.loanApprovalDate || null,
      loanDocsOrderedDate: escrow.loan_docs_ordered_date || timeline.loanDocsOrderedDate || null,
      loanDocsSignedDate: escrow.loan_docs_signed_date || timeline.loanDocsSignedDate || null,
      finalVerificationDate: escrow.final_verification_date || timeline.finalVerificationDate || null,
      walkThroughDate: escrow.walk_through_date || timeline.walkThroughDate || null,
      loanFundedDate: escrow.loan_funded_date || timeline.loanFundedDate || null,
      closingDate: escrow.closing_date || timeline.closingDate || null,
      recordingDate: escrow.recording_date || timeline.recordingDate || null,
      possessionDate: escrow.possession_date || timeline.possessionDate || null,
      rentBackEndDate: escrow.rent_back_end_date || timeline.rentBackEndDate || null,
      actualCoeDate: escrow.actual_coe_date || timeline.actualCoeDate || null,
      scheduledCoeDate: escrow.closing_date || timeline.scheduledCoeDate || null,
      contingenciesDate: escrow.contingencies_date || timeline.contingenciesDate || null,
    },

    // Financials
    financials: {
      purchasePrice: parseFloat(escrow.purchase_price) || financials.purchasePrice || 0,
      earnestMoneyDeposit: parseFloat(escrow.earnest_money_deposit) || financials.earnestMoneyDeposit || 0,
      downPayment: parseFloat(escrow.down_payment) || financials.downPayment || 0,
      loanAmount: parseFloat(escrow.loan_amount) || financials.loanAmount || 0,
      baseCommission: financials.baseCommission || parseFloat(escrow.gross_commission) || 0,
      grossCommission: financials.grossCommission || parseFloat(escrow.gross_commission) || 0,
      myCommission: parseFloat(escrow.my_commission) || financials.myCommission || 0,
      netCommission: parseFloat(escrow.net_commission) || financials.netCommission || 0,
      commissionPercentage: parseFloat(escrow.commission_percentage) || financials.commissionPercentage || 3,
      franchiseFees: financials.franchiseFees || 0,
      franchiseFeePercentage: financials.franchiseFeePercentage || 6.25,
      transactionFee: financials.transactionFee || 285,
      tcFee: financials.tcFee || 250,
      referralFee: parseFloat(escrow.referral_fee) || financials.referralFee || 0,
      referralAgent: escrow.referral_agent || financials.referralAgent || null,
      leadSource: escrow.lead_source || financials.leadSource || null,
      splitPercentage: financials.splitPercentage || 70,
      agentCommission: financials.agentCommission || 0,
      agentNet: financials.agentNet || 0,
      avid: escrow.avid || financials.avid || false,
      commissionAdjustments: parseFloat(escrow.commission_adjustments) || financials.commissionAdjustments || 0,
      expenseAdjustments: parseFloat(escrow.expense_adjustments) || financials.expenseAdjustments || 0,
    },

    // Flattened checklists
    'checklist-loan': checklists.loan || {
      le: false,
      lockedRate: false,
      appraisalOrdered: false,
      appraisalReceived: false,
      clearToClose: false,
      cd: false,
      loanDocsSigned: false,
      cashToClosePaid: false,
      loanFunded: false
    },

    'checklist-house': checklists.house || {
      homeInspectionOrdered: false,
      emd: false,
      solarTransferInitiated: false,
      avid: false,
      homeInspectionReceived: false,
      sellerDisclosures: false,
      rr: false,
      recorded: false
    },

    'checklist-admin': checklists.admin || {
      mlsStatusUpdate: false,
      tcEmail: false,
      tcGlideInvite: false,
      addContactsToPhone: false,
      addContactsToNotion: false
    },

    // Documents array
    documents: escrow.documents || []
  };
}

module.exports = { buildRestructuredEscrowResponse };
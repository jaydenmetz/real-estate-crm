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
  const daysToClose = escrow.closing_date
    ? Math.floor((new Date(escrow.closing_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  // Calculate checklist progress
  let totalItems = 0;
  let completedItems = 0;

  Object.values(checklists).forEach((section) => {
    if (typeof section === 'object' && section !== null) {
      Object.values(section).forEach((value) => {
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
      propertyImage: escrow.property_image_url?.trim() || null,
      zillowUrl: escrow.zillow_url || null,
      escrowStatus: escrow.escrow_status,
      purchasePrice: parseFloat(escrow.purchase_price) || 0,
      earnestMoneyDeposit: parseFloat(escrow.earnest_money_deposit) || financials.earnestMoneyDeposit || 0,
      downPayment: parseFloat(escrow.down_payment) || financials.downPayment || 0,
      loanAmount: parseFloat(escrow.loan_amount) || financials.loanAmount || 0,
      myCommission: parseFloat(escrow.my_commission) || 0,
      scheduledCoeDate: escrow.closing_date || null,
      daysToClose,
      checklistProgress,
      lastActivity: escrow.updated_at || escrow.created_at || null,
      upcomingDeadlines: 2,
      escrowCompany: escrow.escrow_company || null,
      escrowOfficerName: escrow.escrow_officer_name || null,
      escrowOfficerEmail: escrow.escrow_officer_email || null,
      escrowOfficerPhone: escrow.escrow_officer_phone || null,
      titleCompany: escrow.title_company || null,
      transactionType: escrow.transaction_type || 'Purchase',
      leadSource: escrow.lead_source || financials.leadSource || null,
      createdAt: escrow.created_at,
      updatedAt: escrow.updated_at,
      deletedAt: escrow.deleted_at || null, // Include archive status
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
      pricePerSqft: escrow.square_feet && escrow.purchase_price
        ? Math.round(parseFloat(escrow.purchase_price) / escrow.square_feet) : null,
    },

    // People - full contact objects with all details (Notion/FollowUpBoss style)
    people: {
      buyer: people.buyer?.name ? {
        name: people.buyer.name,
        phone: people.buyer.phone || null,
        email: people.buyer.email || null,
        company: people.buyer.company || null,
      } : null,
      seller: people.seller?.name ? {
        name: people.seller.name,
        phone: people.seller.phone || null,
        email: people.seller.email || null,
        company: people.seller.company || null,
      } : null,
      buyerAgent: people.buyerAgent?.name ? {
        name: people.buyerAgent.name,
        phone: people.buyerAgent.phone || null,
        email: people.buyerAgent.email || null,
        company: people.buyerAgent.company || null,
      } : null,
      sellerAgent: people.sellerAgent?.name ? {
        name: people.sellerAgent.name,
        phone: people.sellerAgent.phone || null,
        email: people.sellerAgent.email || null,
        company: people.sellerAgent.company || null,
      } : null,
      loanOfficer: people.loanOfficer?.name ? {
        name: people.loanOfficer.name,
        phone: people.loanOfficer.phone || null,
        email: people.loanOfficer.email || null,
        company: people.loanOfficer.company || null,
      } : null,
      escrowOfficer: people.escrowOfficer?.name ? {
        name: people.escrowOfficer.name,
        phone: people.escrowOfficer.phone || null,
        email: people.escrowOfficer.email || null,
        company: people.escrowOfficer.company || null,
      } : null,
      titleOfficer: people.titleOfficer?.name ? {
        name: people.titleOfficer.name,
        phone: people.titleOfficer.phone || null,
        email: people.titleOfficer.email || null,
        company: people.titleOfficer.company || null,
      } : null,
      homeInspector: people.homeInspector?.name ? {
        name: people.homeInspector.name,
        phone: people.homeInspector.phone || null,
        email: people.homeInspector.email || null,
        company: people.homeInspector.company || null,
      } : null,
      appraiser: people.appraiser?.name ? {
        name: people.appraiser.name,
        phone: people.appraiser.phone || null,
        email: people.appraiser.email || null,
        company: people.appraiser.company || null,
      } : null,
      transactionCoordinator: people.transactionCoordinator?.name || escrow.transaction_coordinator ? {
        name: people.transactionCoordinator?.name || escrow.transaction_coordinator,
        phone: people.transactionCoordinator?.phone || null,
        email: people.transactionCoordinator?.email || null,
        company: people.transactionCoordinator?.company || null,
      } : null,
    },

    // Timeline as array with completed status (Notion/FollowUpBoss style)
    timeline: Array.isArray(timeline) && timeline.length > 0 ? timeline : [
      {
        label: 'Acceptance',
        date: escrow.acceptance_date || null,
        completed: escrow.acceptance_date ? new Date(escrow.acceptance_date) < new Date() : false,
      },
      {
        label: 'EMD Deposited',
        date: escrow.emd_date || null,
        completed: escrow.emd_date ? new Date(escrow.emd_date) < new Date() : false,
      },
      {
        label: 'Home Inspection',
        date: escrow.physical_inspection_date || null,
        completed: escrow.physical_inspection_date ? new Date(escrow.physical_inspection_date) < new Date() : false,
      },
      {
        label: 'Appraisal',
        date: escrow.appraisal_completed_date || escrow.appraisal_ordered_date || null,
        completed: escrow.appraisal_completed_date ? new Date(escrow.appraisal_completed_date) < new Date() : false,
      },
      {
        label: 'Inspection Contingency',
        date: escrow.inspection_contingency_removal_date || null,
        completed: escrow.inspection_contingency_removal_date ? new Date(escrow.inspection_contingency_removal_date) < new Date() : false,
      },
      {
        label: 'Appraisal Contingency',
        date: escrow.appraisal_contingency_removal_date || null,
        completed: escrow.appraisal_contingency_removal_date ? new Date(escrow.appraisal_contingency_removal_date) < new Date() : false,
      },
      {
        label: 'Loan Contingency',
        date: escrow.loan_contingency_removal_date || null,
        completed: escrow.loan_contingency_removal_date ? new Date(escrow.loan_contingency_removal_date) < new Date() : false,
      },
      {
        label: 'All Contingencies Removed',
        date: escrow.all_contingencies_removal_date || null,
        completed: escrow.all_contingencies_removal_date ? new Date(escrow.all_contingencies_removal_date) < new Date() : false,
      },
      {
        label: 'Close of Escrow',
        date: escrow.closing_date || escrow.actual_coe_date || null,
        completed: escrow.actual_coe_date ? new Date(escrow.actual_coe_date) < new Date() : false,
      },
    ].filter(item => item.date), // Only include items with dates

    // Financials - comprehensive commission breakdown
    financials: {
      purchasePrice: parseFloat(escrow.purchase_price) || financials.purchasePrice || 0,
      baseCommission: financials.baseCommission || parseFloat(escrow.gross_commission) || 0,
      grossCommission: financials.grossCommission || parseFloat(escrow.gross_commission) || 0,
      grossCommissionFees: financials.grossCommissionFees || parseFloat(escrow.referral_fee) || 0,
      grossReferralFee: financials.grossReferralFee || financials.grossCommissionFees || parseFloat(escrow.referral_fee) || 0,
      grossReferralFeePercentage: financials.grossReferralFeePercentage || 0,
      adjustedGross: financials.adjustedGross || (parseFloat(escrow.gross_commission) || 0) - (parseFloat(escrow.referral_fee) || 0),
      netCommission: parseFloat(escrow.net_commission) || financials.netCommission || financials.adjustedGross || 0,
      dealExpense: financials.dealExpense || financials.franchiseFees || 0,
      franchiseFees: financials.franchiseFees || financials.dealExpense || 0,
      franchiseFeePercentage: financials.franchiseFeePercentage || 6.25,
      dealNet: financials.dealNet || financials.agentGCI || 0,
      agentGCI: financials.agentGCI || financials.dealNet || 0,
      splitPercentage: financials.splitPercentage || 70,
      agentSplit: financials.agentSplit || parseFloat(escrow.my_commission) || 0,
      agentReferralFee: financials.agentReferralFee || 0,
      agentReferralFeePercentage: financials.agentReferralFeePercentage || 0,
      transactionFee: financials.transactionFee || 285,
      tcFee: financials.tcFee || 250,
      agent1099Income: financials.agent1099Income || 0,
      excessPayment: financials.excessPayment || financials.agent1099Income || 0,
      agentNet: financials.agentNet || financials.excessPayment || 0,
      commissionPercentage: parseFloat(escrow.commission_percentage) || financials.commissionPercentage || 2.5,
      commissionAdjustments: parseFloat(escrow.commission_adjustments) || financials.commissionAdjustments || 0,
      expenseAdjustments: parseFloat(escrow.expense_adjustments) || financials.expenseAdjustments || 0,
    },

    // Nested checklists object (Notion/FollowUpBoss style)
    checklists: {
      loan: {
        le: checklists.loan?.le || false,
        lockedRate: checklists.loan?.lockedRate || false,
        appraisalOrdered: checklists.loan?.appraisalOrdered || false,
        appraisalReceived: checklists.loan?.appraisalReceived || false,
        clearToClose: checklists.loan?.clearToClose || false,
        cd: checklists.loan?.cd || false,
        loanDocsSigned: checklists.loan?.loanDocsSigned || false,
        cashToClosePaid: checklists.loan?.cashToClosePaid || false,
        loanFunded: checklists.loan?.loanFunded || false,
      },
      house: {
        homeInspectionOrdered: checklists.house?.homeInspectionOrdered || false,
        emd: checklists.house?.emd || false,
        solarTransferInitiated: checklists.house?.solarTransferInitiated || false,
        avid: checklists.house?.avid || false,
        homeInspectionReceived: checklists.house?.homeInspectionReceived || false,
        sellerDisclosures: checklists.house?.sellerDisclosures || false,
        rr: checklists.house?.rr || false,
        cr: checklists.house?.cr || false,
        recorded: checklists.house?.recorded || false,
      },
      admin: {
        mlsStatusUpdate: checklists.admin?.mlsStatusUpdate || false,
        tcEmail: checklists.admin?.tcEmail || false,
        tcGlideInvite: checklists.admin?.tcGlideInvite || false,
        addContactsToPhone: checklists.admin?.addContactsToPhone || false,
        addContactsToNotion: checklists.admin?.addContactsToNotion || false,
      },
    },

    // Documents array
    documents: escrow.documents || [],
  };
}

module.exports = { buildRestructuredEscrowResponse };

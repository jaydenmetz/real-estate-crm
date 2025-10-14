import { useMemo } from 'react';
import { differenceInDays, isValid } from 'date-fns';

/**
 * Memoized escrow calculations hook
 * Prevents expensive recalculations on every render
 * Only recalculates when specific escrow fields change
 */
export const useEscrowCalculations = (escrow) => {
  return useMemo(() => {
    // Parse numbers once - support both camelCase and snake_case
    const purchasePrice = parseFloat(escrow.purchase_price || escrow.purchasePrice) || 0;
    const commission = parseFloat(escrow.my_commission || escrow.myCommission) || 0;
    const grossCommission = parseFloat(escrow.gross_commission || escrow.grossCommission) || 0;
    const checklistProgress = parseInt(escrow.checklist_progress || escrow.checklistProgress) || 0;

    // Parse dates once - support both camelCase and snake_case
    const closingDate = escrow.closing_date || escrow.scheduledCoeDate || escrow.closingDate;
    const acceptanceDate = escrow.acceptance_date || escrow.acceptanceDate;
    let daysToClose = null;
    let isUrgent = false;
    let isPastDue = false;

    if (closingDate) {
      const closeDate = new Date(closingDate);
      if (isValid(closeDate)) {
        const days = differenceInDays(closeDate, new Date());
        daysToClose = days;
        isUrgent = days <= 7 && days > 0;
        isPastDue = days < 0;
      }
    }

    return {
      purchasePrice,
      commission,
      grossCommission,
      checklistProgress,
      daysToClose,
      isUrgent,
      isPastDue,
      closingDate,
      acceptanceDate
    };
  }, [
    // Only recalculate if these specific fields change (support both naming conventions)
    escrow.purchase_price,
    escrow.purchasePrice,
    escrow.my_commission,
    escrow.myCommission,
    escrow.gross_commission,
    escrow.grossCommission,
    escrow.checklist_progress,
    escrow.checklistProgress,
    escrow.closing_date,
    escrow.scheduledCoeDate,
    escrow.closingDate,
    escrow.acceptance_date,
    escrow.acceptanceDate
  ]);
};

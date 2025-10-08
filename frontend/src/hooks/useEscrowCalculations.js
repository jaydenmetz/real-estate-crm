import { useMemo } from 'react';
import { differenceInDays, isValid } from 'date-fns';

/**
 * Memoized escrow calculations hook
 * Prevents expensive recalculations on every render
 * Only recalculates when specific escrow fields change
 */
export const useEscrowCalculations = (escrow) => {
  return useMemo(() => {
    // Parse numbers once
    const purchasePrice = parseFloat(escrow.purchasePrice) || 0;
    const commission = parseFloat(escrow.myCommission) || 0;
    const grossCommission = parseFloat(escrow.grossCommission) || 0;
    const checklistProgress = parseInt(escrow.checklistProgress) || 0;

    // Parse dates once
    const closingDate = escrow.scheduledCoeDate || escrow.closingDate;
    const acceptanceDate = escrow.acceptanceDate;
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
    // Only recalculate if these specific fields change
    escrow.purchasePrice,
    escrow.myCommission,
    escrow.grossCommission,
    escrow.checklistProgress,
    escrow.scheduledCoeDate,
    escrow.closingDate,
    escrow.acceptanceDate
  ]);
};

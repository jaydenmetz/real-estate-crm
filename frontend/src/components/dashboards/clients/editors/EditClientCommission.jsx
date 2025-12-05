import React from 'react';
import { EditCommission } from '../../../../templates/Dashboard/lib/editors';

/**
 * Client-specific Commission Editor
 * Wraps EditCommission with client-specific context and styling
 *
 * Similar pattern to EditCommissionAmount for escrows.
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (updates) => void - receives { commission, commission_percentage, commission_type }
 * @param {number} value - Current commission dollar amount
 * @param {number} commissionPercentage - Current commission percentage
 * @param {string} commissionType - Current commission type ('percentage' or 'flat')
 * @param {number} budget - Client budget for percentage calculation
 */
export const EditClientCommission = ({
  open,
  onClose,
  onSave,
  value,
  commissionPercentage,
  commissionType = 'percentage',
  budget
}) => {
  // Wrap onSave to map fields from shared component to client-specific fields
  const handleSave = async (updates) => {
    // EditCommission returns: { my_commission, commission_percentage, commission_type }
    // For clients, we need: { commission, commission_percentage, commission_type }
    const clientUpdates = {
      commission: updates.my_commission,
      commission_percentage: updates.commission_percentage,
      commission_type: updates.commission_type,
    };
    console.log('[EditClientCommission] Saving updates:', { input: updates, output: clientUpdates });
    await onSave(clientUpdates);
  };

  return (
    <EditCommission
      open={open}
      onClose={onClose}
      onSave={handleSave}
      label="Commission"
      value={value}
      commissionPercentage={commissionPercentage}
      commissionType={commissionType}
      purchasePrice={budget} // Use budget as the base for percentage calculation
      color="#06b6d4" // Cyan theme for client commission
    />
  );
};

import React from 'react';
import EscrowForm from './EscrowForm';

// Simple wrapper around EscrowForm for backward compatibility
const EscrowFormSimple = (props) => {
  return <EscrowForm {...props} />;
};

export default EscrowFormSimple;
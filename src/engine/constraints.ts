export interface BuilderState {
  goal: 'Grow' | 'Balance' | 'Preserve';
  risk: number; // 0-100
  factors: string[]; // ['Momentum', 'Tech', 'Dividends', etc.]
  allocation: {
    stocks: number;
    crypto: number;
    bonds: number;
  };
}

export interface ConstraintResult {
  allocation: {
    stocks: number;
    crypto: number;
    bonds: number;
  };
  violations: string[];
  adjustments: string[];
}

/**
 * Apply investment constraints based on goal and risk level
 */
export const applyConstraints = (state: BuilderState): ConstraintResult => {
  const { goal, risk, allocation } = state;
  const violations: string[] = [];
  const adjustments: string[] = [];
  
  // Start with user's desired allocation
  let correctedAllocation = { ...allocation };
  
  // Goal-based constraints
  if (goal === 'Preserve') {
    // Conservative constraints for capital preservation
    if (correctedAllocation.crypto > 5) {
      violations.push('Crypto allocation too high for Preserve goal');
      correctedAllocation.crypto = 5;
      adjustments.push('Crypto capped at 5% for capital preservation');
    }
    
    if (correctedAllocation.stocks > 40) {
      violations.push('Stock allocation too high for Preserve goal');
      correctedAllocation.stocks = 40;
      adjustments.push('Stocks capped at 40% for capital preservation');
    }
    
    // Ensure minimum bond allocation
    if (correctedAllocation.bonds < 50) {
      correctedAllocation.bonds = 50;
      adjustments.push('Bonds increased to 50% minimum for preservation');
    }
  }
  
  if (goal === 'Balance') {
    // Balanced constraints
    if (correctedAllocation.crypto > 15) {
      violations.push('Crypto allocation too high for Balance goal');
      correctedAllocation.crypto = 15;
      adjustments.push('Crypto capped at 15% for balanced approach');
    }
    
    if (correctedAllocation.stocks > 70) {
      violations.push('Stock allocation too high for Balance goal');
      correctedAllocation.stocks = 70;
      adjustments.push('Stocks capped at 70% for balanced approach');
    }
  }
  
  if (goal === 'Grow') {
    // Growth constraints (more lenient)
    if (correctedAllocation.crypto > 25) {
      violations.push('Crypto allocation exceeds prudent limits');
      correctedAllocation.crypto = 25;
      adjustments.push('Crypto capped at 25% for risk management');
    }
  }
  
  // Risk-based constraints
  if (risk < 30) {
    // Low risk constraints
    if (correctedAllocation.bonds < 50) {
      correctedAllocation.bonds = 50;
      adjustments.push('Bonds increased to 50% minimum for low risk');
    }
    
    if (correctedAllocation.crypto > 5) {
      correctedAllocation.crypto = 5;
      adjustments.push('Crypto limited to 5% for low risk tolerance');
    }
    
    if (correctedAllocation.stocks > 45) {
      correctedAllocation.stocks = 45;
      adjustments.push('Stocks limited to 45% for low risk tolerance');
    }
  }
  
  if (risk > 70) {
    // High risk allows more flexibility but still has limits
    if (correctedAllocation.bonds > 30) {
      correctedAllocation.bonds = 30;
      adjustments.push('Bonds capped at 30% for aggressive growth');
    }
  }
  
  // Normalize allocations to sum to 100%
  const total = correctedAllocation.stocks + correctedAllocation.crypto + correctedAllocation.bonds;
  if (total !== 100) {
    const factor = 100 / total;
    correctedAllocation.stocks = Math.round(correctedAllocation.stocks * factor);
    correctedAllocation.crypto = Math.round(correctedAllocation.crypto * factor);
    correctedAllocation.bonds = Math.round(correctedAllocation.bonds * factor);
    
    // Handle rounding errors
    const newTotal = correctedAllocation.stocks + correctedAllocation.crypto + correctedAllocation.bonds;
    if (newTotal !== 100) {
      const diff = 100 - newTotal;
      correctedAllocation.stocks += diff; // Add difference to stocks
    }
    
    if (total !== 100) {
      adjustments.push('Allocations normalized to sum to 100%');
    }
  }
  
  return {
    allocation: correctedAllocation,
    violations,
    adjustments
  };
};

/**
 * Get constraint summary for display
 */
export const getConstraintSummary = (state: BuilderState): string[] => {
  const { goal, risk } = state;
  const constraints: string[] = [];
  
  if (goal === 'Preserve') {
    constraints.push('Risk Cap: Conservative');
    constraints.push('Crypto Limit: 5%');
    constraints.push('Bond Minimum: 50%');
  } else if (goal === 'Balance') {
    constraints.push('Risk Cap: Moderate');
    constraints.push('Crypto Limit: 15%');
    constraints.push('Equity Limit: 70%');
  } else if (goal === 'Grow') {
    constraints.push('Risk Cap: High');
    constraints.push('Crypto Limit: 25%');
    constraints.push('Growth Focus: Enabled');
  }
  
  if (risk < 30) {
    constraints.push('Low Risk: Bond Heavy');
  } else if (risk > 70) {
    constraints.push('High Risk: Growth Heavy');
  }
  
  return constraints;
};
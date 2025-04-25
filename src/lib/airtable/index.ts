// Re-export all Airtable functions from this index file
import { getMonthlyProjections } from './monthly-projections';

// Export the functions
export {
  getMonthlyProjections
};

// In the future, we can add more exports from other files as we refactor the airtable.ts file
// For example:
// export { getKPIMetrics } from './kpi-metrics';
// export { getURLPerformance } from './url-performance';
// etc.

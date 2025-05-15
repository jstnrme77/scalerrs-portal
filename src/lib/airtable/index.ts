// Re-export configuration
export {
  hasAirtableCredentials,
  TABLES,
  ALT_TABLES,
  base,
  airtable
} from './config';

// Re-export types
export * from './types';

// Re-export utility functions
export * from './utils';

// Re-export mock data
export * from './mock-data';

// Re-export table-specific functions
export * from './tables/users';
export * from './tables/clients';
export * from './tables/tasks';
export * from './tables/comments';
export * from './tables/content-workflow';
export * from './tables/articles';
export * from './tables/backlinks';
export * from './tables/approvals';
export * from './tables/kpi';

// Re-export existing functions
import { getMonthlyProjections } from './monthly-projections';
export { getMonthlyProjections };

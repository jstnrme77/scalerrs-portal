// Placeholder type for records from the 'Current KPI' table
export interface CurrentKPIRecord {
  id: string;
  Name?: string;
  'KPI Type'?: string; // Or string[] if it can be multi-select/linked
  'KPI Timestamp'?: string;
  Month?: string;
  'KPI Status'?: string;
  'Δ Difference In KPI'?: number;
  'Target KPI'?: string;
  'Target KPI Value (from Target KPI)'?: number;
  'KPI Value'?: number;
  '1st Owner Of KPI'?: string | string[]; // User/Collaborator or Linked Record
  '2nd Owner Of KPI copy'?: string | string[]; // User/Collaborator or Linked Record
  Year?: number | string;
  Quarter?: string;
  Notes?: string;
  Client?: string | string[]; // Linked Record
  Archived?: boolean;
  [key: string]: any; // Allows for other fields not explicitly defined
}

// Placeholder type for records from the 'WQA' table
export interface WQARecord {
  id: string;
  Name?: string;
  Status?: string;
  'Who Is Responsible'?: string; // Or string[] if multi-select/linked
  'Action Type'?: string;
  'Notes By Scalerrs Du...'?: string; // Field name might be truncated in screenshot
  'Explication: Why?'?: string;
  Client?: string | string[]; // Linked Record
  'Link To Data'?: string; // URL
  [key: string]: any; // Allows for other fields not explicitly defined
}

// Type guards
export function isTask(item: any): item is import('./task').Task { // Referencing Task type from task.ts
  // Basic check, can be made more robust based on required Task fields
  return item && typeof item.id !== 'undefined' && typeof item.task === 'string' && typeof item.status === 'string';
}

export function isCurrentKPIRecord(item: any): item is CurrentKPIRecord {
  // Check for a few key fields that distinguish CurrentKPIRecord
  return item && typeof item.id === 'string' && (typeof item.Name === 'string' || typeof item['KPI Value'] !== 'undefined');
}

export function isWQARecord(item: any): item is WQARecord {
  // Check for a few key fields that distinguish WQARecord
  return item && typeof item.id === 'string' && (typeof item.Name === 'string' || typeof item['Action Type'] !== 'undefined');
}

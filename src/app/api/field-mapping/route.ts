import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';
import { TABLES } from '@/lib/airtable-tables';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';

// Define content types we're using
const CONTENT_TYPES = [
  'keywords',
  'briefs',
  'articles',
  'backlinks'
];

// Define field categories we want to map
const FIELD_CATEGORIES = {
  type: ['Type', 'Content Type', 'Item Type'],
  status: ['Status', 'Approval Status', 'Content Status', 'Keyword Status', 'Brief Status', 'Article Status', 'Backlink Status'],
  title: ['Title', 'Name', 'Main Keyword', 'Keyword', 'Domain', 'Brief Title', 'Article Title', 'Domain URL', 'Source Domain'],
  client: ['Client', 'Clients', 'Client Name', 'Client Account'],
  dateCreated: ['Created Time', 'Created', 'Created At', 'Date Created'],
  lastUpdated: ['Last Updated', 'Last Modified', 'Modified', 'Updated', 'Updated At'],
  assignee: ['SEO Strategist', 'Strategist', 'SEO Assignee', 'Assignee', 'Person Responsible'],
  writer: ['Writer', 'Content Writer', 'Author'],
  volume: ['Search Volume', 'Volume', 'Monthly Volume', 'MSV'],
  difficulty: ['Difficulty', 'Keyword Difficulty', 'KD'],
  wordCount: ['Word Count', 'Final Word Count', 'Words'],
  dueDate: ['Due Date', 'Due Date (Publication)', 'Deadline'],
  domainRating: ['Domain Authority/Rating', 'DR', 'Domain Rating', 'DA', 'Domain Authority'],
  linkType: ['Link Type', 'Type'],
  targetURL: ['Target URL', 'Target Page', 'Destination URL']
  newRefresh: ['New/Refresh', 'New or Refresh', 'Content Type']
};

/**
 * GET endpoint to generate field mapping suggestions
 * 
 * Example usage:
 * /api/field-mapping
 * 
 * @param request The request object
 * @returns JSON response with field mapping suggestions
 */
export async function GET(request: NextRequest) {
  try {
    // Get Airtable API credentials
    const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
    
    if (!apiKey || !baseId) {
      return NextResponse.json({
        error: 'Airtable credentials not found',
        tables: Object.values(TABLES)
      }, { status: 500 });
    }
    
    // Initialize Airtable client
    const airtable = new Airtable({ apiKey });
    const base = airtable.base(baseId);
    
    // Store discovered fields by table
    const tableFields: Record<string, string[]> = {};
    
    // Collect field names from each table
    for (const tableName of Object.values(TABLES)) {
      try {
        // Fetch a few records to discover fields
        const records = await base(tableName).select({
          maxRecords: 5,
          view: 'Grid view'
        }).firstPage();
        
        if (records && records.length > 0) {
          // Extract field names from all records
          const allFields = new Set<string>();
          records.forEach(record => {
            Object.keys(record.fields).forEach(field => allFields.add(field));
          });
          
          // Store fields for this table
          tableFields[tableName] = Array.from(allFields).sort();
        } else {
          tableFields[tableName] = [];
        }
      } catch (error) {
        console.error(`Error fetching fields for table ${tableName}:`, error);
        tableFields[tableName] = [];
      }
    }
    
    // Generate field mappings for each content type
    const fieldMappings: Record<string, Record<string, string[]>> = {};
    
    // For each content type, find the matching fields
    for (const contentType of CONTENT_TYPES) {
      fieldMappings[contentType] = {};
      
      // Determine which table to use for this content type
      const tableName = contentType === 'backlinks' ? TABLES.BACKLINKS : TABLES.KEYWORDS;
      const tableFieldsList = tableFields[tableName] || [];
      
      // For each field category, find matching fields
      for (const [category, possibleFields] of Object.entries(FIELD_CATEGORIES)) {
        // Find fields that exist in the table
        const matchingFields = possibleFields.filter(field => 
          tableFieldsList.includes(field)
        );
        
        // Store the mapping
        fieldMappings[contentType][category] = matchingFields;
      }
    }
    
    // Generate mapping config in the format needed for the app
    const mappingConfig: Record<string, Record<string, string[]>> = {};
    
    // For each content type
    for (const contentType of CONTENT_TYPES) {
      mappingConfig[contentType] = {};
      
      // For each field category
      for (const [category, fields] of Object.entries(fieldMappings[contentType])) {
        // Only include categories with matching fields
        if (fields.length > 0) {
          mappingConfig[contentType][category] = fields;
        }
      }
    }
    
    // Return the results
    return NextResponse.json({
      fieldMappings: mappingConfig,
      discoveredFields: tableFields,
      suggestions: {
        efficientAirtableMappings: generateMappingCode(mappingConfig)
      }
    });
    
  } catch (error: any) {
    console.error('Error in field-mapping API:', error);
    
    return NextResponse.json({
      error: `Failed to generate field mappings: ${error.message}`,
      tables: Object.values(TABLES)
    }, { status: 500 });
  }
}

/**
 * Generate TypeScript code for the field mappings
 * 
 * @param mappings The field mappings
 * @returns TypeScript code as a string
 */
function generateMappingCode(mappings: Record<string, Record<string, string[]>>): string {
  let code = `// Field mappings for different content types
export const FIELD_MAPPINGS = {
`;
  
  // Generate mapping for each content type
  for (const [contentType, categories] of Object.entries(mappings)) {
    code += `  ${contentType}: {\n`;
    
    // Generate mapping for each field category
    for (const [category, fields] of Object.entries(categories)) {
      code += `    ${category}: [${fields.map(f => `'${f}'`).join(', ')}],\n`;
    }
    
    code += `  },\n`;
  }
  
  code += `};

// Helper function to get field value with fallbacks
export function getFieldValue(fields: Record<string, any>, possibleFields: string[], defaultValue: any = null) {
  for (const field of possibleFields) {
    if (fields[field] !== undefined) {
      return fields[field];
    }
  }
  return defaultValue;
}

// Example usage:
// const title = getFieldValue(record.fields, FIELD_MAPPINGS.briefs.title, 'Untitled');
`;
  
  return code;
} 
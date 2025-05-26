// Field mappings for consistent access across the application
export const FIELD_MAPPINGS = {
  // Common fields
  ID: 'id',
  TITLE: ['Title', 'Main Keyword', 'Meta Title'],
  STATUS: ['Status', 'Keyword/Content Status'],
  MONTH: ['Month', 'Month (Keyword Targets)'],
  CLIENT: 'Client',
  
  // Brief specific fields
  BRIEF_STRATEGIST: ['SEO Strategist', 'SEO Specialist'],
  BRIEF_DUE_DATE: ['Due Date', 'Due Date (Publication)'],
  BRIEF_DOCUMENT_LINK: ['Content Brief Link (G Doc)', 'Document Link'],
  BRIEF_APPROVAL: 'Brief Approval',
  BRIEF_NEW_REFRESH: ['New/Refresh', 'New or Refresh'],
  
  // Article specific fields
  ARTICLE_WRITER: ['Content Writer', 'Writer'],
  ARTICLE_EDITOR: ['Content Editor', 'Editor'],
  ARTICLE_WORD_COUNT: ['Word Count', 'WordCount', 'Final Word Count'],
  ARTICLE_DOCUMENT_LINK: ['Content Link (G Doc)', 'Document Link', 'Written Content (G Doc)'],
  ARTICLE_URL: ['Article URL', 'Target Page URL'],
  ARTICLE_APPROVAL: 'Article Approval',
  
  // Content type field
  CONTENT_TYPE: 'Content Type'
};

// Helper function to get field value with fallbacks
export function getFieldValue<T>(fields: Record<string, any>, possibleFields: string[], defaultValue: T): T {
  for (const field of possibleFields) {
    if (fields[field] !== undefined) {
      return fields[field] as T;
    }
  }
  return defaultValue;
}
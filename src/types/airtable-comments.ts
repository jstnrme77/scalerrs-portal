/**
 * Type definitions for Airtable comments system
 */

// Main Airtable comment interface
export interface AirtableComment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  contentType?: string;
  recordId: string;
  createdAt: string;
}

// API response types
export interface AirtableCommentsResponse {
  comments: AirtableComment[];
  recordId: string;
  total: number;
}

export interface AddAirtableCommentResponse {
  comment: AirtableComment;
  success: boolean;
}

export interface AirtableCommentError {
  error: string;
  details?: string;
}

// Legacy comment interface for backward compatibility
export interface LegacyComment {
  id: string;
  text: string;
  author?: string;
  timestamp?: string;
}

// Combined comment type that can handle both legacy and Airtable comments
export type UnifiedComment = AirtableComment | LegacyComment;

// Props for comment components
export interface CommentComponentProps {
  comment: UnifiedComment;
  showReplyButton?: boolean;
  onReply?: (commentId: string) => void;
}

export interface CommentsListProps {
  comments: UnifiedComment[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

// Modal props for conversation history
export interface ConversationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemTitle: string;
  contentType: 'keywords' | 'briefs';
  enableAirtableComments?: boolean;
}

// Comment input props
export interface CommentInputProps {
  onSubmit: (text: string) => void;
  isSubmitting?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

// Hook return types
export interface UseCommentsResult {
  comments: AirtableComment[];
  isLoading: boolean;
  error: string | null;
  addComment: (text: string, contentType?: string) => Promise<void>;
  refreshComments: () => Promise<void>;
  commentCount: number;
}

// Cache configuration
export interface CommentsCacheConfig {
  key: string;
  ttl: number; // Time to live in milliseconds
  maxSize: number;
}

// Comment sorting options
export type CommentSortOrder = 'asc' | 'desc';
export type CommentSortField = 'createdAt' | 'author' | 'text';

export interface CommentSortConfig {
  field: CommentSortField;
  order: CommentSortOrder;
}

// Comment filtering options
export interface CommentFilter {
  author?: string;
  contentType?: string;
  dateRange?: {
    start: string;
    end: string;
  };
} 
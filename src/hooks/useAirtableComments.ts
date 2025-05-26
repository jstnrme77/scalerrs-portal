/**
 * Custom hook for managing Airtable comments
 * Provides state management and operations for Airtable's built-in record comments
 */
import { useState, useEffect, useCallback } from 'react';
import { AirtableComment } from '@/types/airtable-comments';
import { AirtableCommentsService } from '@/services/airtable-comments.service';

export interface UseAirtableCommentsOptions {
  recordId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  useCache?: boolean;
  tableName?: string; // Allow custom table name, defaults to Keywords
}

export interface UseAirtableCommentsReturn {
  comments: AirtableComment[];
  loading: boolean;
  error: string | null;
  addComment: (text: string, contentType?: string) => Promise<boolean>;
  refreshComments: () => Promise<void>;
  clearCache: () => void;
  commentCount: number;
}

/**
 * Hook for managing Airtable comments
 */
export function useAirtableComments({
  recordId,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
  useCache = true,
  tableName = 'Keywords' // Use Keywords table by default for both keywords and backlinks
}: UseAirtableCommentsOptions): UseAirtableCommentsReturn {
  const [comments, setComments] = useState<AirtableComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load comments function
  const loadComments = useCallback(async () => {
    if (!recordId) {
      console.warn('useAirtableComments: No recordId provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`useAirtableComments: Loading comments for record ${recordId} in table ${tableName}`);
      const fetchedComments = await AirtableCommentsService.getComments(recordId, useCache, tableName);
      
      setComments(fetchedComments || []);
      console.log(`useAirtableComments: Loaded ${fetchedComments?.length || 0} comments`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load comments';
      console.error('useAirtableComments: Error loading comments:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [recordId, useCache, tableName]);

  // Add comment function
  const addComment = useCallback(async (text: string, contentType?: string): Promise<boolean> => {
    if (!recordId || !text.trim()) {
      console.warn('useAirtableComments: Cannot add comment - missing recordId or text');
      return false;
    }

    try {
      console.log(`useAirtableComments: Adding comment to record ${recordId} in table ${tableName}`);
      setError(null);
      
      // Add the comment via service
      const newComment = await AirtableCommentsService.addComment(
        recordId,
        text.trim(),
        'User', // Default author
        contentType,
        tableName
      );

      // Optimistically update the UI
      setComments(prevComments => [...prevComments, newComment]);
      
      console.log('useAirtableComments: Comment added successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
      console.error('useAirtableComments: Error adding comment:', errorMessage);
      setError(errorMessage);
      return false;
    }
  }, [recordId, tableName]);

  // Refresh comments function
  const refreshComments = useCallback(async () => {
    console.log('useAirtableComments: Manually refreshing comments');
    await loadComments();
  }, [loadComments]);

  // Clear cache function
  const clearCache = useCallback(() => {
    console.log(`useAirtableComments: Clearing cache for record ${recordId} in table ${tableName}`);
    AirtableCommentsService.clearCache(recordId, tableName);
  }, [recordId, tableName]);

  // Initial load
  useEffect(() => {
    if (recordId) {
      console.log(`useAirtableComments: Initial load for record ${recordId} in table ${tableName}`);
      loadComments();
    }
  }, [recordId, tableName, loadComments]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !recordId || refreshInterval <= 0) {
      return;
    }

    console.log(`useAirtableComments: Setting up auto-refresh every ${refreshInterval}ms for record ${recordId}`);
    
    const interval = setInterval(() => {
      console.log(`useAirtableComments: Auto-refreshing comments for record ${recordId}`);
      loadComments();
    }, refreshInterval);

    return () => {
      console.log(`useAirtableComments: Cleaning up auto-refresh for record ${recordId}`);
      clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, recordId, loadComments]);

  return {
    comments,
    loading,
    error,
    addComment,
    refreshComments,
    clearCache,
    commentCount: comments.length
  };
} 
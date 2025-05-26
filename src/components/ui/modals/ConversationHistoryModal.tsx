'use client';

import React, { useState, useEffect } from 'react';
import { EnhancedModal } from '@/components/ui/modals';
import { MessageCircle, Send, ToggleLeft, ToggleRight } from 'lucide-react';
import { fetchConversationHistory, addApprovalComment } from '@/lib/client-api-utils';
import { AirtableComment } from '@/types/airtable-comments';
import CommentsList from '@/components/ui/comments/CommentsList';
import { useAirtableComments } from '@/hooks/useAirtableComments';

// Legacy comment type for backward compatibility
type Comment = {
  id: string;
  text: string;
  author?: string;
  timestamp?: string;
};

type ConversationHistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemTitle: string;
  contentType: 'keywords' | 'briefs'; // Only allow Keywords and Briefs content types
  enableAirtableComments?: boolean; // New prop to toggle comment systems
};

export default function ConversationHistoryModal({
  isOpen,
  onClose,
  itemId,
  itemTitle,
  contentType,
  enableAirtableComments = false // Default to legacy system
}: ConversationHistoryModalProps) {
  // Legacy comments state
  const [legacyComments, setLegacyComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [legacyLoading, setLegacyLoading] = useState(false);
  const [legacySubmitting, setLegacySubmitting] = useState(false);
  const [useAirtable, setUseAirtable] = useState(enableAirtableComments);
  const [error, setError] = useState<string | null>(null);

  // New Airtable comments functionality using Keywords table for both keywords and backlinks
  const {
    comments: airtableComments,
    loading: airtableLoading,
    error: airtableError,
    addComment: addAirtableComment,
    refreshComments: refreshAirtableComments
  } = useAirtableComments({ 
    recordId: itemId, 
    autoRefresh: true,
    tableName: 'Keywords' // Use Keywords table for both keywords and backlinks
  });

  // Fetch legacy comments when needed
  useEffect(() => {
    if (isOpen && itemId && !useAirtable) {
      fetchLegacyComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, itemId, contentType, useAirtable]);

  const fetchLegacyComments = async () => {
    setLegacyLoading(true);
    setError(null);
    
    try {
      console.log('Fetching legacy comments for:', contentType, itemId);
      const legacyResult = await fetchConversationHistory(contentType, itemId);
      setLegacyComments(legacyResult || []);
    } catch (error) {
      console.error('Error fetching legacy comments:', error);
      setError('Failed to load legacy comments. Please try again.');
      setLegacyComments([]);
    } finally {
      setLegacyLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setError(null);
    
    try {
      if (useAirtable) {
        // Add to Airtable comments system using the new hook
        console.log('Adding Airtable comment for record:', itemId);
        const success = await addAirtableComment(newComment.trim(), contentType);

        if (success) {
          setNewComment(''); // Clear the input
        } else {
          setError('Failed to add comment. Please try again.');
        }
      } else {
        // Add to legacy system
        setLegacySubmitting(true);
        console.log('Adding legacy comment for:', contentType, itemId);
        const result = await addApprovalComment(contentType, itemId, newComment);

        if (result) {
          // Add the new comment to the legacy comments list
          setLegacyComments(prev => [...prev, {
            id: result.id || `temp-${Date.now()}`,
            text: newComment,
            author: 'You', // This would be the current user in a real app
            timestamp: new Date().toLocaleDateString()
          }]);
          setNewComment(''); // Clear the input
        } else {
          setError('Failed to add comment. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment. Please try again.');
    } finally {
      setLegacySubmitting(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  // Toggle between comment systems
  const handleToggleCommentSystem = () => {
    const newValue = !useAirtable;
    setUseAirtable(newValue);
    setError(null);
  };

  // Get current loading state and comments based on selected system
  const isLoading = useAirtable ? airtableLoading : legacyLoading;
  const isSubmitting = useAirtable ? false : legacySubmitting; // Airtable hook handles its own submission state
  const currentError = useAirtable ? airtableError : error;
  const currentComments = useAirtable ? airtableComments : legacyComments;

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Conversation History - ${itemTitle}`}
      size="md"
    >
      <div className="flex flex-col h-[60vh]">
        {/* Error Message */}
        {currentError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{currentError}</p>
          </div>
        )}

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto mb-4">
          {useAirtable ? (
            <CommentsList
              comments={airtableComments}
              isLoading={airtableLoading}
              error={airtableError}
              onRefresh={refreshAirtableComments}
              showContentType={true}
              showFullTimestamp={true}
              maxHeight="300px"
              emptyStateMessage="No comments yet"
              emptyStateSubMessage={`Be the first to comment on this ${contentType.slice(0, -1)}`}
            />
          ) : (
            // Legacy comments display
            isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#9EA8FB] animate-spin"></div>
                <span className="ml-2 text-gray-500">Loading comments...</span>
              </div>
            ) : currentComments.length > 0 ? (
              <div className="space-y-4">
                {(currentComments as Comment[]).map((comment) => (
                  <div key={comment.id} className="bg-[#9EA8FB] p-3 rounded-lg">
                    <div className="flex items-start">
                      <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center mr-2 text-[#9EA8FB]">
                        <span>{comment.author ? comment.author.charAt(0).toUpperCase() : 'U'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-medium text-white">{comment.author || 'User'}</span>
                          <span className="text-xs text-white/80">{comment.timestamp || 'Just now'}</span>
                        </div>
                        <p className="text-sm mt-1 text-white">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle size={32} className="mb-2 text-gray-400" />
                <p>No comments yet</p>
                <p className="text-sm">Be the first to start the conversation</p>
                <p className="text-xs mt-2 text-center text-gray-400">
                  Using {useAirtable ? 'Airtable Comments (New)' : 'Legacy Comments'} system
                </p>
              </div>
            )
          )}
        </div>

        {/* Add Comment Section */}
        <div className="border-t pt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Add a comment about this ${contentType.slice(0, -1)}...`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9EA8FB] focus:border-transparent text-sm"
              disabled={isSubmitting}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-2 bg-[#9EA8FB] text-white rounded-lg hover:bg-[#7C85FB] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add'}
            </button>
          </div>
          {/* <p className="text-xs text-gray-500 mt-1">
            Press Enter to submit • Currently using {useAirtable ? 'Airtable Comments (Keywords table)' : 'Legacy Comments'}
          </p> */}
        </div>
      </div>
    </EnhancedModal>
  );
}

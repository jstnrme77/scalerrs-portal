'use client';

import React, { useState, useEffect } from 'react';
import { EnhancedModal } from '@/components/ui/modals';
import { MessageCircle, Send } from 'lucide-react';
import { fetchConversationHistory, addApprovalComment } from '@/lib/client-api-utils';

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
};

export default function ConversationHistoryModal({
  isOpen,
  onClose,
  itemId,
  itemTitle,
  contentType
}: ConversationHistoryModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments when the modal opens
  useEffect(() => {
    if (isOpen && itemId) {
      fetchComments();
    }
  }, [isOpen, itemId, contentType]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const result = await fetchConversationHistory(contentType, itemId);
      setComments(result || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      // If there's an error, set empty comments
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await addApprovalComment(contentType, itemId, newComment);

      // Add the new comment to the list
      if (result) {
        setComments([...comments, {
          id: result.id || `temp-${Date.now()}`,
          text: newComment,
          author: 'You', // This would be the current user in a real app
          timestamp: new Date().toLocaleDateString()
        }]);
      }

      // Clear the input
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Conversation History - ${itemTitle}`}
      size="md"
    >
      <div className="flex flex-col h-[60vh]">
        {/* Comments List */}
        <div className="flex-1 overflow-y-auto mb-4 p-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#9EA8FB] animate-spin"></div>
              <span className="ml-2 text-gray-500">Loading comments...</span>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start">
                    <div className="bg-[#9EA8FB] rounded-full w-8 h-8 flex items-center justify-center mr-2 text-white">
                      <span>{comment.author ? comment.author.charAt(0).toUpperCase() : 'U'}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-medium">{comment.author || 'User'}</span>
                        <span className="text-xs text-gray-500">{comment.timestamp || 'Just now'}</span>
                      </div>
                      <p className="text-sm mt-1">{comment.text}</p>
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
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="border-t pt-4">
          <div className="flex items-center">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Add a comment..."
              className="flex-1 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#9EA8FB] min-h-[80px] resize-none"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end mt-2">
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isSubmitting}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                !newComment.trim() || isSubmitting
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-[#000000] text-white hover:bg-gray-800'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </EnhancedModal>
  );
}

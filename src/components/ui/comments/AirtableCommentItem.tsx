'use client';

import React from 'react';
import { AirtableComment } from '@/types/airtable-comments';

interface AirtableCommentItemProps {
  comment: AirtableComment;
  showContentType?: boolean;
  showFullTimestamp?: boolean;
  isUnread?: boolean;
  onMarkAsRead?: (commentId: string) => void;
}

export default function AirtableCommentItem({
  comment,
  showContentType = false,
  showFullTimestamp = false,
  isUnread = false,
  onMarkAsRead
}: AirtableCommentItemProps) {

  /**
   * Get initials from author name
   */
  const getAuthorInitials = (author: string): string => {
    if (!author || author === 'Unknown') return 'U';
    
    const names = author.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  /**
   * Generate consistent avatar color based on author name
   */
  const getAvatarColor = (author: string): string => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
      'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-gray-500',
      'bg-emerald-500', 'bg-orange-500', 'bg-teal-500', 'bg-cyan-500'
    ];
    
    // Generate a consistent color based on author name hash
    let hash = 0;
    for (let i = 0; i < author.length; i++) {
      hash = author.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  /**
   * Format timestamp for display
   */
  const formatDisplayTime = (): string => {
    if (showFullTimestamp) {
      try {
        const date = new Date(comment.createdAt);
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return comment.timestamp;
      }
    }
    return comment.timestamp;
  };

  /**
   * Handle click event for marking as read
   */
  const handleClick = () => {
    if (isUnread && onMarkAsRead) {
      onMarkAsRead(comment.id);
    }
  };

  return (
    <div 
      className={`
        flex items-start space-x-3 p-3 rounded-lg transition-all duration-200
        ${isUnread ? 'bg-gray-200 opacity-50' : 'bg-gray-200 hover:bg-[#7C85FB]'}
        ${onMarkAsRead ? 'cursor-pointer' : ''}
      `}
      onClick={handleClick}
    >
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
        bg-white text-[#9EA8FB]
        ${isUnread ? 'ring-2 ring-[#9EA8FB] opacity-90 ring-offset-2' : ''}
      `}>
        {getAuthorInitials(comment.author)}
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline justify-between flex-wrap gap-1">
          <div className="flex items-center space-x-2">
            <span className={`
              text-sm font-medium text-gray-900
              ${isUnread ? 'font-semibold' : ''}
            `}>
              {comment.author}
            </span>
            {isUnread && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                New
              </span>
            )}
          </div>
          <time className="text-xs text-gray-500 whitespace-nowrap">
            {formatDisplayTime()}
          </time>
        </div>

        {/* Comment Text */}
        <div className="mt-1">
          <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
            {comment.text}
          </p>
        </div>

        {/* Metadata */}
        {showContentType && comment.contentType && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
              {comment.contentType}
            </span>
          </div>
        )}

        {/* Unread indicator dot */}
        {isUnread && (
          <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
      </div>
    </div>
  );
} 
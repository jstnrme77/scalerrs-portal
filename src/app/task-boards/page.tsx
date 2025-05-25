'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TabNavigation, { TabContent } from '@/components/ui/navigation/TabNavigation';
import PageContainer, { PageContainerHeader, PageContainerBody, PageContainerTabs } from '@/components/ui/layout/PageContainer';
import { BarChart, Wrench, LightbulbIcon } from 'lucide-react';
import { 
  fetchWQATasks, 
  updateWQATaskStatus, 
  addWQATaskComment, 
  fetchWQATaskComments, 
  clearWQATasksCache, 
  createWQATask,
  getCROTasks,
  createCROTask,
  updateCROTaskStatus,
  clearCROTasksCache
} from '@/lib/client-api-utils';
import { useClientData } from '@/context/ClientDataContext';
// Import task types from our types file
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskEffort,
  ActiveTask,
  CompletedTask,
  AirtableTask,
  mapAirtableTaskToTask,
  TaskComment
} from '@/types/task';

// Define Comment type for this page
type Comment = {
  id: number | string;
  author: string;
  text: string;
  timestamp: string;
  replies?: Comment[];
};

// Sample task data
const taskBoards: Record<string, Task[]> = {
  technicalSEO: [
    {
      id: 1,
      task: 'Fix broken internal links',
      status: 'In Progress' as TaskStatus,
      priority: 'High' as TaskPriority,
      assignedTo: 'Acex Romero',
      dateLogged: 'Mar 10',
      impact: 4,
      effort: 'M' as TaskEffort,
      comments: [
        { id: 1, author: 'Acex Romero', text: 'Found 15 broken links so far', timestamp: 'Mar 12' }
      ],
      notes: 'Focus on high-traffic pages first'
    } as ActiveTask,
    {
      id: 2,
      task: 'Implement schema markup on product pages',
      status: 'In Progress' as TaskStatus,
      priority: 'High' as TaskPriority,
      assignedTo: 'Taylor Green',
      dateLogged: 'Mar 15',
      impact: 3,
      effort: 'M' as TaskEffort,
      comments: [],
      notes: 'Use Product schema type'
    } as ActiveTask,
    {
      id: 3,
      task: 'Optimize site speed (Core Web Vitals)',
      status: 'Not Started' as TaskStatus,
      priority: 'High' as TaskPriority,
      assignedTo: 'Schonn Force',
      dateLogged: 'Mar 20',
      impact: 5,
      effort: 'L' as TaskEffort,
      comments: [],
      notes: 'Focus on LCP and CLS issues'
    } as ActiveTask,
    {
      id: 4,
      task: 'Fix duplicate content issues',
      status: 'Not Started' as TaskStatus,
      priority: 'Medium' as TaskPriority,
      assignedTo: 'Amy White',
      dateLogged: 'Mar 22',
      impact: 3,
      effort: 'M' as TaskEffort,
      comments: [],
      notes: 'Check category pages'
    } as ActiveTask,
    {
      id: 5,
      task: 'Analytics Audit',
      status: 'Not Started' as TaskStatus,
      priority: 'Low' as TaskPriority,
      assignedTo: 'Amy White',
      dateLogged: 'Mar 15',
      impact: 2,
      effort: 'S' as TaskEffort,
      comments: [
        { id: 1, author: 'Amy White', text: 'Will start next week', timestamp: 'Mar 16' }
      ]
    } as ActiveTask,
    {
      id: 6,
      task: 'Fix mobile usability issues',
      status: 'Done' as TaskStatus,
      priority: 'High' as TaskPriority,
      assignedTo: 'Taylor Green',
      dateLogged: 'Mar 01',
      impact: 4,
      effort: 'M' as TaskEffort,
      comments: [
        { id: 1, author: 'Taylor Green', text: 'All issues fixed and verified', timestamp: 'Mar 28' }
      ],
      completedDate: 'Mar 28'
    } as CompletedTask,
    {
      id: 7,
      task: 'Implement canonical tags',
      status: 'Done' as TaskStatus,
      priority: 'Medium' as TaskPriority,
      assignedTo: 'Schonn Force',
      dateLogged: 'Feb 25',
      impact: 3,
      effort: 'S' as TaskEffort,
      comments: [],
      completedDate: 'Mar 05'
    } as CompletedTask,
  ],
  cro: [
    {
      id: 1,
      task: 'Increase CTA Visibility',
      status: 'In Progress' as TaskStatus,
      priority: 'Medium' as TaskPriority,
      assignedTo: 'Acex Romero',
      dateLogged: 'Mar 10',
      impact: 4,
      effort: 'S' as TaskEffort,
      comments: [
        { id: 1, author: 'Acex Romero', text: 'Testing 3 different button styles', timestamp: 'Mar 15' }
      ]
    } as ActiveTask,
    {
      id: 2,
      task: 'Improve Form UX',
      status: 'Done' as TaskStatus,
      priority: 'High' as TaskPriority,
      assignedTo: 'Taylor Green',
      dateLogged: 'Mar 01',
      impact: 3,
      effort: 'M' as TaskEffort,
      comments: [
        { id: 1, author: 'Taylor Green', text: 'Reduced form fields from 8 to 5', timestamp: 'Mar 20' },
        { id: 2, author: 'Acex Romero', text: 'Conversion rate improved by 12%', timestamp: 'Apr 01' },
        { id: 3, author: 'Taylor Green', text: 'Added inline validation', timestamp: 'Apr 02' },
        { id: 4, author: 'Schonn Force', text: 'Looks great!', timestamp: 'Apr 03' },
        { id: 5, author: 'Taylor Green', text: 'Marking as complete', timestamp: 'Apr 04' }
      ],
      completedDate: 'Apr 04'
    } as CompletedTask,
    {
      id: 3,
      task: 'Test Exit-intent Popup',
      status: 'Done' as TaskStatus,
      priority: 'Low' as TaskPriority,
      assignedTo: 'Schonn Force',
      dateLogged: 'Feb 15',
      impact: 4,
      effort: 'S' as TaskEffort,
      comments: [
        { id: 1, author: 'Schonn Force', text: 'A/B test complete - 8% improvement', timestamp: 'Feb 25' },
        { id: 2, author: 'Amy White', text: 'Great results!', timestamp: 'Feb 26' }
      ],
      completedDate: 'Feb 28'
    } as CompletedTask,
    {
      id: 4,
      task: 'Analytics Audit',
      status: 'Not Started' as TaskStatus,
      priority: 'Low' as TaskPriority,
      assignedTo: 'Amy White',
      dateLogged: 'Mar 15',
      impact: 2,
      effort: 'S' as TaskEffort,
      comments: [
        { id: 1, author: 'Amy White', text: 'Will start next week', timestamp: 'Mar 16' }
      ]
    } as ActiveTask
  ],
  strategyAdHoc: [
    {
      id: 1,
      task: 'Develop Q2 content calendar',
      status: 'In Progress' as TaskStatus,
      priority: 'High' as TaskPriority,
      assignedTo: 'Taylor Green',
      dateLogged: 'Mar 01',
      impact: 4,
      effort: 'M' as TaskEffort,
      comments: [
        { id: 1, author: 'Taylor Green', text: 'Draft ready for review', timestamp: 'Mar 15' }
      ]
    } as ActiveTask,
    {
      id: 2,
      task: 'Conduct keyword gap analysis',
      status: 'Done' as TaskStatus,
      priority: 'High' as TaskPriority,
      assignedTo: 'Acex Romero',
      dateLogged: 'Feb 20',
      impact: 5,
      effort: 'L' as TaskEffort,
      comments: [
        { id: 1, author: 'Acex Romero', text: 'Found 25 high-opportunity keywords', timestamp: 'Mar 10' }
      ],
      completedDate: 'Mar 15'
    } as CompletedTask,
    {
      id: 3,
      task: 'Develop link building strategy',
      status: 'Not Started' as TaskStatus,
      priority: 'Medium' as TaskPriority,
      assignedTo: 'Schonn Force',
      dateLogged: 'Mar 20',
      impact: 4,
      effort: 'M' as TaskEffort,
      comments: []
    } as ActiveTask
  ]
};

// Priority Badge Component
function PriorityBadge({ priority, originalPriority }: { priority?: TaskPriority, originalPriority?: string }) {
  if (!priority && !originalPriority) {
    return <span className="px-3 py-1.5 text-sm font-medium rounded-lg inline-flex items-center justify-center w-full bg-lightGray text-mediumGray">-</span>;
  }
  
  let bgColor = '';
  let textColor = '';
  let displayText = originalPriority || priority || '-';
  
  // Determine colors based on priority level
  if (priority?.includes('High') || originalPriority?.includes('High') || priority === 'High') {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    // Remove emojis if present
    if (originalPriority && originalPriority.includes('🔥')) {
      displayText = 'High Priority';
    }
  } else if (priority?.includes('Low') || originalPriority?.includes('Low') || priority === 'Low') {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
    // Remove emojis if present
    if (originalPriority && originalPriority.includes('🔥')) {
      displayText = 'Low Priority';
    }
  } else if (priority?.includes('Medium') || priority?.includes('Mid') || 
             originalPriority?.includes('Medium') || originalPriority?.includes('Mid') || 
             priority === 'Medium') {
    bgColor = 'bg-gold/10';
    textColor = 'text-gold';
    // Remove emojis if present
    if (originalPriority && originalPriority.includes('🔥')) {
      displayText = 'Mid Priority';
    }
  } else {
    bgColor = 'bg-lightGray';
    textColor = 'text-mediumGray';
  }

  return (
    <span className={`px-3 py-1.5 text-sm font-medium rounded-lg inline-flex items-center justify-center w-full ${bgColor} ${textColor}`}>
      {displayText}
    </span>
  );
}

// Impact Badge Component
function ImpactBadge({ impact, originalImpact }: { impact?: number, originalImpact?: string }) {
  if (impact === undefined && !originalImpact) {
    return <span className="px-3 py-1.5 text-sm font-medium rounded-lg inline-flex items-center justify-center w-full bg-lightGray text-mediumGray">-</span>;
  }
  
  let bgColor = '';
  let textColor = '';
  let displayText = originalImpact || (impact !== undefined ? impact.toString() : '-');

  // Determine colors based on impact level
  if (impact === 5 || (originalImpact && originalImpact.includes('High'))) {
    bgColor = 'bg-gray-200';
    textColor = 'text-gray-800';
    // Remove emojis if present
    if (originalImpact && originalImpact.includes('📈')) {
      displayText = 'High Impact';
    }
  } else if (impact === 4) {
    bgColor = 'bg-blue-100';
    textColor = 'text-blue-800';
  } else if (impact === 3 || (originalImpact && (originalImpact.includes('Medium') || originalImpact.includes('Mid')))) {
    bgColor = 'bg-indigo-100';
    textColor = 'text-indigo-800';
    // Remove emojis if present
    if (originalImpact && originalImpact.includes('📈')) {
      displayText = 'Mid Impact';
    }
  } else if (impact === 2) {
    bgColor = 'bg-teal-100';
    textColor = 'text-teal-800';
  } else if (impact === 1 || (originalImpact && originalImpact.includes('Low'))) {
    bgColor = 'bg-gray-100';
    textColor = 'text-gray-800';
    // Remove emojis if present
    if (originalImpact && originalImpact.includes('📈')) {
      displayText = 'Low Impact';
    }
  } else {
    bgColor = 'bg-lightGray';
    textColor = 'text-mediumGray';
  }

  return (
    <span className={`px-3 py-1.5 text-sm font-medium rounded-lg inline-flex items-center justify-center w-full ${bgColor} ${textColor}`}>
      {displayText}
    </span>
  );
}

// Effort Badge Component
function EffortBadge({ effort, originalEffort }: { effort?: TaskEffort, originalEffort?: string }) {
  if (!effort && !originalEffort) {
    return <span className="px-3 py-1.5 text-sm font-medium rounded-lg inline-flex items-center justify-center w-full bg-lightGray text-mediumGray">-</span>;
  }
  
  let bgColor = '';
  let textColor = '';
  let displayText = originalEffort || effort || '-';

  // Determine colors based on effort level
  if (effort === 'S' || effort === 'Low Effort' || 
      (originalEffort && originalEffort.includes('Low'))) {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
    // Remove emojis if present
    if (originalEffort && originalEffort.includes('❗')) {
      displayText = 'Low Effort';
    }
  } else if (effort === 'L' || effort === 'High Effort' || 
            (originalEffort && originalEffort.includes('High'))) {
    bgColor = 'bg-orange-100';
    textColor = 'text-orange-800';
    // Remove emojis if present
    if (originalEffort && originalEffort.includes('❗')) {
      displayText = 'High Effort';
    }
  } else if (effort === 'M' || effort === 'Mid Effort' || 
            (originalEffort && (originalEffort.includes('Medium') || originalEffort.includes('Mid')))) {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
    // Remove emojis if present
    if (originalEffort && originalEffort.includes('❗')) {
      displayText = 'Mid Effort';
    }
  } else {
    bgColor = 'bg-lightGray';
    textColor = 'text-mediumGray';
  }

  return (
    <span className={`px-3 py-1.5 text-sm font-medium rounded-lg inline-flex items-center justify-center w-full ${bgColor} ${textColor}`}>
      {displayText}
    </span>
  );
}

// Comment Component
function CommentItem({ comment }: { comment: Comment }) {
  // Handle different comment formats
  const authorName = comment.author || 'User';
  const commentText = typeof comment.text === 'string' 
    ? comment.text 
    : (comment as any).Comment || 'No text';
  const commentTime = comment.timestamp || (comment as any).CreatedAt || 'Unknown date';

  return (
    <div className="mb-2 last:mb-0 p-3">
      <div className="flex items-start">
        <div className="bg-lightGray rounded-lg w-6 h-6 flex items-center justify-center mr-2 mt-0.5">
          <span className="text-xs font-medium">{authorName.charAt(0)}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-baseline">
            <span className="text-base font-medium text-dark">{authorName}</span>
            <span className="text-base text-mediumGray ml-2">{commentTime}</span>
          </div>
          <p className="text-base text-dark mt-0.5">{commentText}</p>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 mt-2 border-l-2 border-lightGray pl-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}

// Comments Section Component
function CommentsSection({ comments, taskId }: { comments: Comment[], taskId: number | string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [taskComments, setTaskComments] = useState<Comment[]>(comments);
  // Track the comment count to display
  const [commentCount, setCommentCount] = useState<number>(comments.length);

  // Fetch comments when expanded
  useEffect(() => {
    if (isExpanded) {
      const fetchTaskComments = async () => {
        try {
          setLoading(true);
          // Fetch comments from the API
          const fetchedComments = await fetchWQATaskComments(taskId.toString());
          console.log('Fetched comments for task:', taskId, fetchedComments);
          
          // If we got comments from the API, use them, otherwise use the provided comments
          if (fetchedComments && Array.isArray(fetchedComments) && fetchedComments.length > 0) {
            // Map the comments to our Comment type
            const mappedComments = fetchedComments.map((comment: any) => ({
              id: comment.id || `comment-${Date.now()}-${Math.random()}`,
              text: comment.text || comment.Comment || '',
              author: comment.author || comment.User || 'User',
              timestamp: comment.timestamp || comment.CreatedAt || new Date().toLocaleDateString()
            }));
            setTaskComments(mappedComments);
            setCommentCount(mappedComments.length);
          } else if (comments && comments.length > 0) {
            // Fall back to the provided comments if API returns no data
            setTaskComments(comments);
            setCommentCount(comments.length);
          }
        } catch (error) {
          console.error('Error fetching comments:', error);
          // If there's an error, use the provided comments
          setTaskComments(comments);
          setCommentCount(comments.length);
        } finally {
          setLoading(false);
        }
      };

      fetchTaskComments();
    }
  }, [isExpanded, taskId, comments]);

  const handleAddComment = async (e?: React.FormEvent) => {
    // Prevent form submission if event is provided
    if (e) e.preventDefault();
    
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      // Call the API to add the comment
      const response = await addWQATaskComment(taskId.toString(), newComment);
      console.log('Added comment response:', response);
      
      // Create a new comment object from the API response
      let newCommentObj = {
        id: 'temp-comment-' + Date.now(),
        author: 'You',
        text: newComment,
        timestamp: new Date().toLocaleDateString()
      };
      
      // If the API response contains a comment object, use it
      if (response && typeof response === 'object') {
        if ('comment' in response && response.comment) {
          // Response contains a properly formatted comment object
          const commentData = response.comment as any;
          newCommentObj = {
            id: commentData.id || newCommentObj.id,
            author: commentData.author || newCommentObj.author,
            text: commentData.text || newCommentObj.text,
            timestamp: commentData.timestamp || newCommentObj.timestamp
          };
        } else if ('id' in response) {
          // Response itself is the comment
          newCommentObj = {
            id: response.id as string || newCommentObj.id,
            author: (response as any).author || newCommentObj.author,
            text: (response as any).text || newCommentObj.text,
            timestamp: (response as any).timestamp || newCommentObj.timestamp
          };
        }
      }

      // Add the new comment to the list
      setTaskComments(prevComments => [...prevComments, newCommentObj]);
      // Update the comment count
      setCommentCount(prevCount => prevCount + 1);
      setNewComment('');
      
      // Refresh the comments list after a short delay
      setTimeout(async () => {
        if (typeof taskId === 'string' && taskId) {
          try {
            const refreshedComments = await fetchWQATaskComments(taskId, undefined, false);
            if (refreshedComments && Array.isArray(refreshedComments) && refreshedComments.length > 0) {
              // Map the comments to our Comment type
              const mappedComments = refreshedComments.map((comment: any) => ({
                id: comment.id || `comment-${Date.now()}-${Math.random()}`,
                text: comment.text || comment.Comment || '',
                author: comment.author || comment.User || 'User',
                timestamp: comment.timestamp || comment.CreatedAt || new Date().toLocaleDateString()
              }));
              setTaskComments(mappedComments);
              setCommentCount(mappedComments.length);
            }
          } catch (refreshError) {
            console.error('Error refreshing comments:', refreshError);
          }
        }
      }, 1000);
    } catch (error) {
      console.error('Error adding comment:', error);

      // Still update UI for better UX
      const newCommentObj = {
        id: `comment-${Date.now()}`,
        author: 'You',
        text: newComment,
        timestamp: new Date().toLocaleDateString()
      };

      setTaskComments([...taskComments, newCommentObj]);
      setCommentCount(prevCount => prevCount + 1);
      setNewComment('');
    } finally {
      setLoading(false);
    }
  };

  // Handle key press for comment input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <div className="mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-base font-medium text-primary hover:underline"
      >
        <div className="bg-gray-200 text-gray-700 text-base font-medium px-2 py-1 rounded-lg flex items-center mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          {commentCount}
        </div>
        {commentCount === 1 ? 'Comment' : 'Comments'}
      </button>

      {isExpanded && (
        <div className="mt-2">
          <div className="bg-gray-100/50 p-4 rounded-[12px] mb-2">
            {loading && taskComments.length === 0 ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-lg h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : taskComments.length > 0 ? (
              taskComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            ) : (
              <p className="text-base text-mediumGray">No comments yet</p>
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex">
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 border border-gray-200 rounded-lg p-2 text-base focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || loading}
              className="bg-[#000000] text-white px-4 py-2 rounded-lg text-base font-medium disabled:opacity-50 ml-2"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: TaskStatus }) {
  let bgColor = '';
  let textColor = '';

  switch (status) {
    case 'Not Started':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      break;
    case 'In Progress':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'Blocked':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    case 'Done':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    default:
      bgColor = 'bg-lightGray';
      textColor = 'text-mediumGray';
  }

  return (
    <span className={`px-3 py-1.5 text-sm font-medium rounded-lg inline-flex items-center justify-center w-full ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
}

// Task Card Component
function TaskCard({
  task,
  onStatusChange
}: {
  task: Task;
  onStatusChange: (id: number | string, status: TaskStatus) => void;
}) {
  return (
    <div className="card bg-white p-6 rounded-lg border-2 border-gray-200" style={{ color: '#353233' }}>
      <div className="flex justify-between items-start mb-5">
        <h3 className="text-base font-medium text-text-light dark:text-text-dark mt-2">{task.task}</h3>
        <div className="flex gap-2 min-w-[200px]">
          <div className="flex-1">
            <PriorityBadge priority={task.priority} originalPriority={task.originalPriority} />
          </div>
          <div className="flex-1">
            <StatusBadge status={task.status} />
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-gray-300 mb-5"></div>

      <div className="mb-5">
        <div className="text-base text-mediumGray dark:text-gray-300 mb-2">
          <span className="font-medium">Assigned to:</span> {task.assignedTo}
        </div>
        <div className="text-base text-mediumGray dark:text-gray-300 mb-2">
          <span className="font-medium">Logged:</span> {task.dateLogged}
        </div>
        {task.status === 'Done' && task.completedDate && (
          <div className="text-base text-mediumGray dark:text-gray-300">
            <span className="font-medium">Completed:</span> {task.completedDate}
          </div>
        )}
      </div>

      <div className="flex items-center gap-5 mb-5">
        <div className="flex-1 max-w-[120px]">
          <span className="text-base text-mediumGray dark:text-gray-300 block mb-2">Impact</span>
          <ImpactBadge impact={task.impact} originalImpact={task.originalImpact} />
        </div>
        <div className="flex-1 max-w-[120px]">
          <span className="text-base text-mediumGray dark:text-gray-300 block mb-2">Effort</span>
          <EffortBadge effort={task.effort} originalEffort={task.originalEffort} />
        </div>
      </div>

      {task.notes && (
        <>
          <div className="w-full h-px bg-gray-300 mb-5"></div>
          <div className="mb-5">
            <div className="text-base text-mediumGray dark:text-gray-300 mb-2">Notes</div>
            <p className="text-base text-text-light dark:text-text-dark bg-lightGray/30 dark:bg-darkGray/30 p-6 rounded-lg">{task.notes}</p>
          </div>
        </>
      )}

      <div className="w-full h-px bg-gray-300 mb-5"></div>
      <CommentsSection comments={task.comments} taskId={task.id} />

      <div className="w-full h-px bg-gray-300 mb-5 mt-5"></div>
      <div className="flex space-x-3">
        {task.status === 'Not Started' && (
          <button
            onClick={() => onStatusChange(task.id, 'In Progress')}
            className="px-6 py-1 text-base font-medium text-white bg-[#000000] rounded-lg hover:bg-[#000000]/80 transition-colors"
          >
            Start
          </button>
        )}

        {task.status === 'In Progress' && (
          <>
            <button
              onClick={() => onStatusChange(task.id, 'Done')}
              className="px-6 py-1 text-base font-medium text-white bg-[#000000] rounded-lg hover:bg-[#000000]/80 transition-colors"
            >
              Complete
            </button>
            <button
              onClick={() => onStatusChange(task.id, 'Blocked')}
              className="px-6 py-1 text-base font-medium text-red-800 bg-red-100 rounded-lg hover:bg-red-700 hover:text-white transition-colors"
            >
              Block
            </button>
          </>
        )}

        {task.status === 'Blocked' && (
          <button
            onClick={() => onStatusChange(task.id, 'In Progress')}
            className="px-6 py-1 text-base font-medium text-blue-800 bg-blue-100 rounded-lg hover:bg-blue-700 hover:text-white transition-colors"
          >
            Resume
          </button>
        )}

        {task.status === 'Done' && (
          <button
            onClick={() => onStatusChange(task.id, 'In Progress')}
            className="px-6 py-1 text-base font-medium text-mediumGray bg-lightGray rounded-lg hover:bg-gray-300 transition-colors"
          >
            Reopen
          </button>
        )}
      </div>
    </div>
  );
}

// Task Table Component
function TaskTable({
  tasks,
  onStatusChange
}: {
  tasks: Task[];
  onStatusChange: (id: number | string, status: TaskStatus) => void;
}) {
  const [expandedTaskId, setExpandedTaskId] = useState<number | string | null>(null);
  const [expandedTaskComments, setExpandedTaskComments] = useState<Record<string, Comment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isPosting, setIsPosting] = useState<Record<string, boolean>>({});

  // Sort tasks: 1st by Status, 2nd by Priority, 3rd by Date Logged
  const sortedTasks = [...tasks].sort((a, b) => {
    // First sort by status
    const statusOrder = {
      'In Progress': 1,
      'Not Started': 2,
      'Blocked': 3,
      'Done': 4
    };

    const statusComparison = statusOrder[a.status] - statusOrder[b.status];
    if (statusComparison !== 0) return statusComparison;

    // Then sort by priority
    const priorityOrder: Record<string, number> = {
      'High': 1,
      'High Priority': 1,
      'Medium': 2,
      'Mid Priority': 2, 
      'Low': 3,
      'Low Priority': 3
    };

    // Handle undefined priority values
    if (!a.priority && !b.priority) {
      // If both priorities are undefined, they're equal
      // Continue to date comparison
    } else if (!a.priority) {
      // Undefined priorities go last
      return 1;
    } else if (!b.priority) {
      // Undefined priorities go last
      return -1;
    } else {
      // Both have priorities, compare them
      // Normalize priority values by removing emojis and getting their base priority level
      const getNormalizedPriority = (priority: string): number => {
        if (priority.includes('High')) return 1;
        if (priority.includes('Mid') || priority.includes('Medium')) return 2;
        if (priority.includes('Low')) return 3;
        return 4; // Default for unknown priorities
      };
      
      const aPriority = getNormalizedPriority(a.priority);
      const bPriority = getNormalizedPriority(b.priority);
      
      const priorityComparison = aPriority - bPriority;
      if (priorityComparison !== 0) return priorityComparison;
    }

    // Finally sort by date logged (newest first)
    // This is a simplified comparison - in a real app, you'd parse the dates properly
    return b.dateLogged.localeCompare(a.dateLogged);
  });

  // Handle comment input change
  const handleCommentInputChange = (taskId: string | number, value: string) => {
    setCommentInputs(prev => ({
      ...prev,
      [taskId.toString()]: value
    }));
  };

  // Handle posting a comment
  const handlePostComment = async (taskId: string | number) => {
    const commentText = commentInputs[taskId.toString()] || '';
    if (!commentText.trim()) return;

    try {
      setIsPosting(prev => ({
        ...prev,
        [taskId.toString()]: true
      }));

      // Call the API to add the comment
      const response = await addWQATaskComment(taskId.toString(), commentText);
      console.log('Added comment response:', response);
      
      // Create a new comment object
      const newComment = {
        id: `comment-${Date.now()}`,
        author: 'You',
        text: commentText,
        timestamp: new Date().toLocaleDateString()
      };

      // Update the comments for this task
      setExpandedTaskComments(prev => ({
        ...prev,
        [taskId.toString()]: [...(prev[taskId.toString()] || []), newComment]
      }));

      // Clear the input
      setCommentInputs(prev => ({
        ...prev,
        [taskId.toString()]: ''
      }));

      // Also update the task's comment count in the main task list
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        const task = tasks[taskIndex];
        if (task.commentCount !== undefined) {
          task.commentCount += 1;
        } else if (task.comments) {
          task.comments.push(newComment);
        }
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsPosting(prev => ({
        ...prev,
        [taskId.toString()]: false
      }));
    }
  };

  // When a task is expanded, load its comments
  useEffect(() => {
    if (expandedTaskId) {
      const loadComments = async () => {
        try {
          const comments = await fetchWQATaskComments(expandedTaskId.toString());
          if (Array.isArray(comments)) {
            setExpandedTaskComments(prev => ({
              ...prev,
              [expandedTaskId.toString()]: comments
            }));
          }
        } catch (error) {
          console.error('Error loading comments:', error);
        }
      };
      
      loadComments();
    }
  }, [expandedTaskId]);

  return (
    <div className="mb-6" style={{ color: '#353233' }}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed bg-white">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[25%] rounded-bl-[12px]">Task</th>
              <th className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider w-[12%]">Status</th>
              <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[15%]">Assigned to</th>
              <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[10%]">Date Logged</th>
              <th className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider w-[12%]">Priority</th>
              <th className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider w-[12%]">Impact</th>
              <th className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider w-[9%]">Effort</th>
              <th className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider w-[5%] rounded-br-[12px]">Comments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedTasks.map((task) => (
              <React.Fragment key={task.id}>
                <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}>
                  <td className="px-4 py-4 w-[25%]">
                    <div className="flex items-start">
                      <div>
                        <div className="text-base font-medium text-dark">{task.task}</div>
                        {task.notes && <div className="text-base text-mediumGray mt-1">{task.notes.substring(0, 60)}{task.notes.length > 60 ? '...' : ''}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center w-[12%]">
                    <div className="max-w-full mx-auto">
                      <StatusBadge status={task.status} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-base text-dark w-[15%]">{task.assignedTo}</td>
                  <td className="px-4 py-4 text-base text-mediumGray w-[10%] whitespace-nowrap">{task.dateLogged}</td>
                  <td className="px-4 py-4 text-center w-[12%]">
                    <div className="max-w-full mx-auto">
                      <PriorityBadge priority={task.priority} originalPriority={task.originalPriority} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center w-[12%]">
                    <div className="max-w-full mx-auto">
                      <ImpactBadge impact={task.impact} originalImpact={task.originalImpact} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center w-[9%]">
                    <div className="max-w-full mx-auto">
                      <EffortBadge effort={task.effort} originalEffort={task.originalEffort} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center w-[5%]">
                    <div className="flex justify-center">
                      <div className="bg-gray-200 text-gray-700 text-base font-medium px-2 py-1 rounded-lg flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        {task.commentCount !== undefined ? task.commentCount : task.comments.length}
                      </div>
                    </div>
                  </td>
                </tr>
                {expandedTaskId === task.id && (
                  <tr>
                    <td colSpan={8} className="px-4 py-4 bg-white border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        {task.notes && (
                          <div>
                            <h4 className="text-base font-medium text-dark mb-1">Notes</h4>
                            <p className="text-base text-dark bg-gray-100/50 p-4 rounded-[12px] border border-gray-200">{task.notes}</p>
                          </div>
                        )}
                        <div>
                          <h4 className="text-base font-medium text-dark mb-1">Comments</h4>
                          <div className="bg-gray-100/50 p-4 rounded-[12px] border border-gray-200">
                            {expandedTaskComments[task.id.toString()] ? 
                              (expandedTaskComments[task.id.toString()].length > 0 ? (
                                expandedTaskComments[task.id.toString()].map((comment) => (
                                  <CommentItem key={comment.id} comment={comment} />
                                ))
                              ) : (
                                <p className="text-base text-mediumGray">No comments yet</p>
                              )) : (
                                task.comments.length > 0 ? (
                                  task.comments.map((comment) => (
                                    <CommentItem key={comment.id} comment={comment} />
                                  ))
                                ) : (
                                  <p className="text-base text-mediumGray">No comments yet</p>
                                )
                              )
                            }

                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <form 
                                className="flex" 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handlePostComment(task.id);
                                }}
                              >
                                <input
                                  type="text"
                                  placeholder="Add a comment..."
                                  className="flex-1 border border-gray-200 rounded-lg p-2 text-base focus:outline-none focus:ring-1 focus:ring-gray-400"
                                  value={commentInputs[task.id.toString()] || ''}
                                  onChange={(e) => handleCommentInputChange(task.id, e.target.value)}
                                  disabled={isPosting[task.id.toString()]}
                                />
                                <button
                                  type="submit"
                                  className="bg-[#000000] text-white px-4 py-2 rounded-lg text-base font-medium ml-2 disabled:opacity-50"
                                  disabled={!commentInputs[task.id.toString()]?.trim() || isPosting[task.id.toString()]}
                                >
                                  {isPosting[task.id.toString()] ? 'Posting...' : 'Post'}
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {sortedTasks.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-base text-mediumGray">
                  No tasks found in this section
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Add Task Modal Component
function AddTaskModal({
  isOpen,
  onClose,
  onAdd,
  boardType
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Task, originalFormData?: { priority: string; impact: string; effort: string }) => void;
  boardType: string;
}) {
  // Define a type for the form data
  type TaskFormData = {
    task: string;
    priority: TaskPriority;
    assignedTo: string;
    impact: string;
    effort: TaskEffort;
    notes: string;
    referenceLinks: string; // String for the form, will be converted to string[] when submitting
  };

  const [taskData, setTaskData] = useState<TaskFormData>({
    task: '',
    priority: 'Mid Priority',
    assignedTo: '',
    impact: 'Mid Impact',
    effort: 'Mid Effort',
    notes: '',
    referenceLinks: ''
  }); 

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskData.task.trim()) {
      // Format reference links if provided
      const referenceLinks = taskData.referenceLinks.trim()
        ? taskData.referenceLinks.split('\n').filter(link => link.trim() !== '')
        : undefined;

      // Convert impact string to number for the Task interface
      let impactNumber: number = 3; // Default to medium
      if (taskData.impact.includes('High')) {
        impactNumber = 5;
      } else if (taskData.impact.includes('Low')) {
        impactNumber = 1;
      } else if (taskData.impact.includes('Mid')) {
        impactNumber = 3;
      }

      // Create a task object with the correct type
      const newTask: Task = {
        task: taskData.task,
        priority: taskData.priority,
        assignedTo: taskData.assignedTo.trim() || 'Unassigned',
        impact: impactNumber, // Use converted number for Task interface
        effort: taskData.effort,
        notes: taskData.notes,
        id: Date.now(),
        status: 'Not Started',
        dateLogged: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        comments: [],
        referenceLinks: referenceLinks
      };

      // Pass both the task and original form data
      onAdd(newTask, {
        priority: taskData.priority,
        impact: taskData.impact,
        effort: taskData.effort
      });

      // Reset form
      setTaskData({
        task: '',
        priority: 'Mid Priority' as TaskPriority,
        assignedTo: '',
        impact: 'Mid Impact',
        effort: 'Mid Effort' as TaskEffort,
        notes: '',
        referenceLinks: ''
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white p-8 rounded-[12px] border-2 border-gray-200 shadow-lg max-w-xl w-full pointer-events-auto">
        <div className="bg-gray-100 p-6 border-b border-gray-200 -mx-8 -mt-8 mb-8 flex justify-between items-center rounded-t-[12px]">
          <h3 className="text-lg font-bold text-black px-2">Add New Task to {boardType} Board</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-mediumGray mb-2">Task Name</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-[12px] p-3 focus:outline-none focus:ring-2 focus:ring-[#000000]"
                placeholder="Enter task description"
                value={taskData.task}
                onChange={(e) => setTaskData({ ...taskData, task: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-mediumGray mb-2">Assigned To</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-[12px] p-3 focus:outline-none focus:ring-2 focus:ring-[#000000]"
                placeholder="Enter assignee name"
                value={taskData.assignedTo}
                onChange={(e) => setTaskData({ ...taskData, assignedTo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-mediumGray mb-2">Priority</label>
              <select
                className="w-full border border-gray-200 rounded-[12px] p-3 focus:outline-none focus:ring-2 focus:ring-[#000000]"
                value={taskData.priority}
                onChange={(e) => setTaskData({ ...taskData, priority: e.target.value as TaskPriority })}
              >
                <option value="High Priority">High Priority</option>
                <option value="Mid Priority">Mid Priority</option>
                <option value="Low Priority">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-mediumGray mb-2">Impact</label>
              <select
                className="w-full border border-gray-200 rounded-[12px] p-3 focus:outline-none focus:ring-2 focus:ring-[#000000]"
                value={taskData.impact}
                onChange={(e) => setTaskData({ ...taskData, impact: e.target.value })}
              >
                <option value="High Impact">High Impact</option>
                <option value="Mid Impact">Mid Impact</option>
                <option value="Low Impact">Low Impact</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-mediumGray mb-2">Effort</label>
              <select
                className="w-full border border-gray-200 rounded-[12px] p-3 focus:outline-none focus:ring-2 focus:ring-[#000000]"
                value={taskData.effort}
                onChange={(e) => setTaskData({ ...taskData, effort: e.target.value as TaskEffort })}
              >
                <option value="High Effort">High Effort</option>
                <option value="Mid Effort">Mid Effort</option>
                <option value="Low Effort">Low Effort</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-mediumGray mb-2">Notes</label>
              <textarea
                className="w-full border border-gray-200 rounded-[12px] p-3 focus:outline-none focus:ring-2 focus:ring-[#000000] min-h-[80px]"
                placeholder="Add any additional notes or context"
                value={taskData.notes}
                onChange={(e) => setTaskData({ ...taskData, notes: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-mediumGray mb-2">Reference Links</label>
              <textarea
                className="w-full border border-gray-200 rounded-[12px] p-3 focus:outline-none focus:ring-2 focus:ring-[#000000] min-h-[60px]"
                placeholder="Add reference links (one per line)"
                value={taskData.referenceLinks}
                onChange={(e) => setTaskData({ ...taskData, referenceLinks: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-base font-medium text-[#000000] border border-[#000000] rounded-[12px] hover:bg-[#000000]/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-base font-medium text-white bg-[#000000] rounded-[12px] hover:bg-[#000000]/80 transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TaskBoards() {
  const [activeBoard, setActiveBoard] = useState('technicalSEO');
  const [boards, setBoards] = useState<Record<string, Task[]>>(taskBoards);
  const [addTaskModal, setAddTaskModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get client data context for filtering by client
  const { clientId, filterDataByClient } = useClientData();
  
  // Track raw data before filtering
  const [rawBoards, setRawBoards] = useState<Record<string, Task[]>>(taskBoards);

  // Direct API fetch function with client filtering parameter
  const directFetchTasks = async (
    boardType: string,
    skipCache: boolean = true
  ) => {
    try {
      // Add timestamp to prevent browser caching
      const timestamp = Date.now().toString();
      
      // Create the URL with parameters
      let url = boardType === 'cro' 
        ? `cro-tasks?t=${timestamp}` 
        : `wqa-tasks?type=${encodeURIComponent(boardType)}&t=${timestamp}`;
      
      // Add clientId parameter if provided and not 'all'
      if (clientId && clientId !== 'all') {
        url += `&clientId=${encodeURIComponent(clientId)}`;
      }
      
      // Create a cache key based on the board type and client ID
      const cacheKey = `tasks_${boardType}_${clientId || 'all'}`;
      
      // Check cache first if not skipping
      if (!skipCache && typeof window !== 'undefined') {
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);
            const cacheTime = parsedData.timestamp || 0;
            const now = Date.now();
            
            // Use cache if it's less than 1 minute old
            if (now - cacheTime < 60000) {
              console.log(`Using cached data for ${cacheKey} (${Math.round((now - cacheTime) / 1000)}s old)`);
              return parsedData.data;
            } else {
              console.log(`Cache expired for ${cacheKey} (${Math.round((now - cacheTime) / 1000)}s old)`);
            }
          } catch (e) {
            console.error('Error parsing cached data:', e);
          }
        }
      }
      
      // Call the API endpoint directly with cache prevention headers
      const response = await fetch(`/api/${url}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate that the response contains expected data structure
      if (!data || !data.tasks) {
        console.error('Invalid response format from API', data);
        throw new Error('Invalid response format from API');
      }
      
      // Store in sessionStorage cache
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
          console.log(`Cached data for ${cacheKey}`);
        } catch (e) {
          console.error('Error caching data:', e);
        }
      }
      
      // Log client ID filter for debugging
      if (clientId && clientId !== 'all') {
        console.log(`Received ${data.tasks.length} tasks from API for client ${clientId}`);
        
        // Verify a sample of items to ensure client filtering worked
        if (data.tasks.length > 0) {
          const sampleSize = Math.min(3, data.tasks.length);
          console.log(`Sample verification of ${sampleSize} tasks for client ${clientId}:`);
          for (let i = 0; i < sampleSize; i++) {
            const task = data.tasks[i];
            const clientField = task.Clients || task.Client;
            console.log(`- Task ${i+1} (${task.id}) client field:`, clientField);
          }
        }
      } else {
        console.log(`Received ${data.tasks.length} tasks from API (all clients)`);
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching ${boardType} tasks:`, error);
      // Return empty data structure instead of throwing
      return {
        tasks: [],
        error: (error as Error).message
      };
    }
  };

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasksForBoard = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Use direct fetch with client filtering built in
        const response = await directFetchTasks(activeBoard, true);
        console.log(`${activeBoard} Tasks Response:`, response);
        
        // Extract tasks from the response
        const tasks = response.tasks || [];
        
        // Map the Airtable tasks to our Task type
        const mappedTasks = tasks.map((task: any) => {
          // Extract the task fields
          const {
            id,
            Name,
            Status,
            'Assigned To': AssignedTo,
            Date: dateLogged,
            Priority: priority,
            Impact: impact,
            Effort: effort,
            Comments: comments = [],
            commentCount = 0,
            Actions: actions,
            Notes: notes,
            'Completed Date': completedDate,
            Client: client,
            Clients: clients
          } = task;
          
          // Process comments if they exist
          let processedComments: any[] = [];
          if (comments) {
            if (Array.isArray(comments)) {
              processedComments = comments.map((comment: any, index: number) => {
                if (typeof comment === 'object' && comment !== null) {
                  return {
                    id: comment.id || `comment-${index}`,
                    author: comment.author || comment.User || 'User',
                    text: comment.text || comment.Comment || comment.toString(),
                    timestamp: comment.timestamp || comment.CreatedAt || new Date().toLocaleDateString()
                  };
                } else {
                  return {
                    id: `comment-${index}`,
                    author: 'User',
                    text: comment.toString(),
                    timestamp: new Date().toLocaleDateString()
                  };
                }
              });
            } else if (typeof comments === 'object' && comments !== null) {
              processedComments = [{
                id: comments.id || 'comment-1',
                author: comments.author || comments.User || 'User',
                text: comments.text || comments.Comment || comments.toString(),
                timestamp: comments.timestamp || comments.CreatedAt || new Date().toLocaleDateString()
              }];
            } else if (typeof comments === 'string') {
              const commentBlocks = comments.split('\n\n')
                .filter(block => block.trim().length > 0);
              
              processedComments = commentBlocks.map((block, index) => {
                const lines = block.split('\n');
                const headerLine = lines[0] || '';
                
                let author = 'User';
                let timestamp = new Date().toLocaleDateString();
                
                const headerMatch = headerLine.match(/^(.+?)\s+(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\/\d{1,2}\/\d{2})$/);
                if (headerMatch) {
                  author = headerMatch[1].trim();
                  timestamp = headerMatch[2].trim();
                }
                
                const commentText = lines.slice(1).join('\n').trim();
                
                return {
                  id: `comment-${id}-${index}`,
                  author,
                  text: commentText || headerLine,
                  timestamp
                };
              });
            }
          }
          
          // Map to our Task type
          let mappedTask: any = {
            id,
            task: Name || task.task || '',
            status: Status as TaskStatus || 'Not Started',
            // Handle AssignedTo which can be an object with id, email, name properties
            assignedTo: AssignedTo ? 
              (typeof AssignedTo === 'object' ? 
                (AssignedTo.name || `${AssignedTo.email || 'User'}`) : 
                String(AssignedTo)
              ) : 'Not Assigned',
            dateLogged: dateLogged || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            // Store the original Airtable values for display with emojis
            originalPriority: priority || undefined,
            originalImpact: impact || undefined,
            originalEffort: effort || undefined,
            // Don't set defaults for these fields - keep them blank if not provided by Airtable
            priority: priority ? (priority as TaskPriority) : undefined,
            impact: impact !== undefined && impact !== null ? 
              (typeof impact === 'number' ? impact : 
                (typeof impact === 'string' ? parseInt(impact, 10) || undefined : undefined)) : undefined,
            effort: effort ? (effort as TaskEffort) : undefined,
            comments: processedComments,
            // Use the commentCount from the API response if available
            commentCount: commentCount !== undefined ? commentCount : processedComments.length,
            notes: notes || '',
            // Preserve client fields for filtering
            Client: client || task.Client,
            Clients: clients || task.Clients
          };
          
          // Add completedDate if Status is Done
          if (Status === 'Done') {
            mappedTask.completedDate = completedDate || 
              new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            mappedTask = mappedTask as CompletedTask;
          } else {
            mappedTask = mappedTask as ActiveTask;
          }
          
          return mappedTask;
        });
        
        // Store the raw tasks (no client filtering since the API already filtered)
        setRawBoards(prev => {
          const newBoards = { ...prev };
          newBoards[activeBoard] = mappedTasks;
          return newBoards;
        });
        
        // Set the filtered tasks (same as raw since API already filtered)
        setBoards(prev => {
          const newBoards = { ...prev };
          newBoards[activeBoard] = mappedTasks;
          return newBoards;
        });
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching tasks:', err);
        setError(`An error occurred while fetching tasks: ${err.message}`);
        
        // Set empty arrays for both raw and filtered boards
        const emptyBoards = {
          technicalSEO: [] as Task[],
          cro: [] as Task[],
          strategyAdHoc: [] as Task[]
        };
        
        setRawBoards(emptyBoards);
        setBoards(emptyBoards);
        setLoading(false);
      }
    };

    fetchTasksForBoard();
  }, [activeBoard, clientId]);

  // Function to refresh task data
  const refreshData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Use direct fetch with client filtering built in
      const response = await directFetchTasks(activeBoard, true);
      console.log(`Refreshed ${activeBoard} Tasks Response:`, response);
      
      // Extract and map tasks
      const tasks = response.tasks || [];
      const mappedTasks = tasks.map((task: any) => mapAirtableTaskToTask(task));
      
      // Group tasks by type
      const tasksForBoard = {
        technicalSEO: [] as Task[],
        cro: [] as Task[],
        strategyAdHoc: [] as Task[]
      };
      
      // Sort tasks into the right boards
      mappedTasks.forEach((task: Task) => {
        const taskAny = task as any;
        const type = taskAny.Type || 'Unknown';
        
        if (type === 'CRO' || activeBoard === 'cro') {
          tasksForBoard.cro.push(task);
        } else if (type === 'Technical SEO' || type === 'WQA' || activeBoard === 'technicalSEO') {
          tasksForBoard.technicalSEO.push(task);
        } else {
          tasksForBoard.strategyAdHoc.push(task);
        }
      });
      
      // Update both raw and boards with the new data
      // Since API already filtered by client, we don't need additional filtering
      setRawBoards(prev => ({
        ...prev,
        [activeBoard]: tasksForBoard[activeBoard as keyof typeof tasksForBoard]
      }));
      
      setBoards(prev => ({
        ...prev,
        [activeBoard]: tasksForBoard[activeBoard as keyof typeof tasksForBoard]
      }));
      
      setLoading(false);
    } catch (err) {
      console.error('Error refreshing tasks:', err);
      setError('Failed to refresh tasks. Please try again.');
      setLoading(false);
    }
  };

  const handleAddTask = async (task: Task, originalFormData?: { priority: string; impact: string; effort: string }) => {
    try {
      setLoading(true);
      
      let newTask;
      let taskData = {
        task: task.task,
        status: task.status,
        // Use original form values if available, otherwise use defaults
        priority: originalFormData?.priority || task.priority || 'Mid Priority',
        assignedTo: task.assignedTo && task.assignedTo !== 'Unassigned' ? task.assignedTo : '',
        impact: originalFormData?.impact || task.impact || 'Mid Impact',
        effort: originalFormData?.effort || task.effort || 'Mid Effort',
        notes: task.notes
      };
      
      // Call the appropriate API based on the active board
      if (activeBoard === 'cro') {
        // Use CRO-specific API for CRO board
        newTask = await createCROTask(taskData);
        console.log('Created new CRO task result:', newTask);
      } else {
        // Use WQA API for other boards with board type
        newTask = await createWQATask({
          ...taskData,
          boardType: activeBoard
        });
        console.log('Created new WQA task result:', newTask);
      }
      
      console.log('Created new task:', newTask);
      
      // Base properties for task object with proper type casting
      const taskBase = {
        id: newTask.id || `task-${Date.now()}`,
        task: newTask.task || task.task,
        status: (newTask.status as TaskStatus) || task.status,
        priority: (newTask.priority as TaskPriority) || task.priority,
        assignedTo: newTask.assignedTo || task.assignedTo || 'Unassigned',
        impact: newTask.impact || task.impact,
        effort: (newTask.effort as TaskEffort) || task.effort,
        notes: newTask.notes || task.notes,
        dateLogged: newTask.dateLogged || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        comments: newTask.comments || [],
        commentCount: newTask.commentCount || 0,
        // Add both Client and Clients fields for compatibility with filtering
        Client: clientId && clientId !== 'all' ? clientId : undefined,
        Clients: clientId && clientId !== 'all' ? clientId : undefined
      };
      
      // Create the proper task type based on status
      let createdTask: Task;
      if ((newTask.status === 'Done' || task.status === 'Done')) {
        createdTask = {
          ...taskBase,
          status: 'Done' as TaskStatus,
          completedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        } as CompletedTask;
      } else {
        createdTask = {
          ...taskBase,
          status: taskBase.status as 'Not Started' | 'In Progress' | 'Blocked'
        } as ActiveTask;
      }
      
      // Add the new task to our local state
      setRawBoards(prev => {
        const newBoards = { ...prev };
        newBoards[activeBoard] = [
          ...newBoards[activeBoard],
          createdTask
        ];
        return newBoards;
      });
      
      // Also add to filtered boards
      setBoards(prev => {
        const newBoards = { ...prev };
        newBoards[activeBoard] = [
          ...newBoards[activeBoard],
          createdTask
        ];
        return newBoards;
      });
      
      setAddTaskModal(false);
      setLoading(false);
      
      // Refresh the task list to ensure we have the latest data
      setTimeout(() => {
        refreshData();
      }, 1000);
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task. Please try again.');
      setLoading(false);
      
      // Still update the UI for better UX
      setRawBoards(prev => {
        const newBoards = { ...prev };
        newBoards[activeBoard] = [
          ...newBoards[activeBoard],
          task
        ];
        return newBoards;
      });
      
      // Also add to filtered boards
      setBoards(prev => {
        const newBoards = { ...prev };
        newBoards[activeBoard] = [
          ...newBoards[activeBoard],
          task
        ];
        return newBoards;
      });

      setAddTaskModal(false);
    }
  };

  // Get the current board's tasks
  const currentTasks = boards[activeBoard] || [];

  const handleStatusChange = async (id: number | string, newStatus: TaskStatus) => {
    try {
      // Get the current client for debugging
      const currentClient = clientId === null || clientId === 'all' ? 'all' : clientId;
      console.log(`Updating task ${id} status to ${newStatus} with client filter: ${currentClient}`);
      
      // Map frontend status to Airtable status before sending to API
      let airtableStatus: string;
      switch (newStatus) {
        case 'Not Started':
          airtableStatus = 'To Do';
          break;
        case 'In Progress':
          airtableStatus = 'In Progress';
          break;
        case 'Blocked':
          airtableStatus = 'Blocked';
          break;
        case 'Done':
          airtableStatus = 'Complete';
          break;
        default:
          airtableStatus = 'To Do';
      }
      
      // Update task status using the appropriate API based on the active board
      if (activeBoard === 'cro') {
        // Use CRO-specific API for CRO board
        const result = await updateCROTaskStatus(id.toString(), airtableStatus);
        console.log('CRO task update result:', result);
      } else {
        // Use WQA API for other boards
        const result = await updateWQATaskStatus(id.toString(), airtableStatus);
        console.log('WQA task update result:', result);
      }
      
      console.log(`Task ${id} status updated successfully`);
      
      // Update local state with frontend status
      setBoards(prev => {
        const newBoards = { ...prev };
        const taskIndex = newBoards[activeBoard].findIndex(task =>
          task.id === id || task.id.toString() === id.toString()
        );

        if (taskIndex !== -1) {
          console.log(`Updating local state for task ${id} from ${newBoards[activeBoard][taskIndex].status} to ${newStatus}`);
          const currentTask = newBoards[activeBoard][taskIndex];

          if (newStatus === 'Done') {
            // When moving to Done, add completedDate
            const updatedTask = {
              ...currentTask,
              status: newStatus,
              completedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            } as CompletedTask;
            newBoards[activeBoard][taskIndex] = updatedTask;
          } else {
            // When moving to other statuses
            const updatedTask = {
              ...currentTask,
              status: newStatus,
              completedDate: undefined
            } as ActiveTask;
            newBoards[activeBoard][taskIndex] = updatedTask;
          }
        } else {
          console.warn(`Task with ID ${id} not found in ${activeBoard} board`);
        }

        return newBoards;
      });
      
      // Also update the raw boards state
      setRawBoards(prev => {
        const newBoards = { ...prev };
        const taskIndex = newBoards[activeBoard].findIndex(task =>
          task.id === id || task.id.toString() === id.toString()
        );

        if (taskIndex !== -1) {
          console.log(`Updating raw state for task ${id}`);
          const currentTask = newBoards[activeBoard][taskIndex];

          if (newStatus === 'Done') {
            // When moving to Done, add completedDate
            const updatedTask = {
              ...currentTask,
              status: newStatus,
              completedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            } as CompletedTask;
            newBoards[activeBoard][taskIndex] = updatedTask;
          } else {
            // When moving to other statuses
            const updatedTask = {
              ...currentTask,
              status: newStatus,
              completedDate: undefined
            } as ActiveTask;
            newBoards[activeBoard][taskIndex] = updatedTask;
          }
        }

        return newBoards;
      });
      
      // Refresh data after a short delay to ensure we get the latest from Airtable
      setTimeout(() => {
        console.log('Refreshing data after status update');
        refreshData();
      }, 1000);
    } catch (err) {
      console.error('Error updating task status:', err);

      // Update local state anyway for better UX
      setBoards(prev => {
        const newBoards = { ...prev };
        const taskIndex = newBoards[activeBoard].findIndex(task =>
          task.id === id || task.id.toString() === id.toString()
        );

        if (taskIndex !== -1) {
          const currentTask = newBoards[activeBoard][taskIndex];

          if (newStatus === 'Done') {
            // When moving to Done, add completedDate
            const updatedTask = {
              ...currentTask,
              status: newStatus,
              completedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            } as CompletedTask;
            newBoards[activeBoard][taskIndex] = updatedTask;
          } else {
            // When moving to other statuses
            const updatedTask = {
              ...currentTask,
              status: newStatus,
              completedDate: undefined
            } as ActiveTask;
            newBoards[activeBoard][taskIndex] = updatedTask;
          }
        } else {
          console.warn(`Task with ID ${id} not found in ${activeBoard} board`);
        }

        return newBoards;
      });
      
      // Also update the raw boards state
      setRawBoards(prev => {
        const newBoards = { ...prev };
        const taskIndex = newBoards[activeBoard].findIndex(task =>
          task.id === id || task.id.toString() === id.toString()
        );

        if (taskIndex !== -1) {
          const currentTask = newBoards[activeBoard][taskIndex];

          if (newStatus === 'Done') {
            // When moving to Done, add completedDate
            const updatedTask = {
              ...currentTask,
              status: newStatus,
              completedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            } as CompletedTask;
            newBoards[activeBoard][taskIndex] = updatedTask;
          } else {
            // When moving to other statuses
            const updatedTask = {
              ...currentTask,
              status: newStatus,
              completedDate: undefined
            } as ActiveTask;
            newBoards[activeBoard][taskIndex] = updatedTask;
          }
        }

        return newBoards;
      });
    }
  };

  return (
    <DashboardLayout
      topNavBarProps={{
        onAddTask: () => setAddTaskModal(true)
      }}
    >
      <PageContainer>
        <PageContainerTabs>
          <TabNavigation
            tabs={[
              { id: 'cro', label: 'CRO', icon: <BarChart size={18} /> },
              { id: 'technicalSEO', label: 'Technical SEO', icon: <Wrench size={18} /> },
              { id: 'strategyAdHoc', label: 'Strategy / Ad Hoc', icon: <LightbulbIcon size={18} /> }
            ]}
            activeTab={activeBoard}
            onTabChange={setActiveBoard}
            variant="primary"
            tabClassName="bg-gray-100 border-gray-200"
            activeTabClassName="bg-[#000000] text-white"
          />
        </PageContainerTabs>
        <PageContainerBody>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#000000]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : (
            <div className="max-w-[calc(100%)]">
              <TaskTable
                tasks={currentTasks}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}
        </PageContainerBody>
      </PageContainer>

      <AddTaskModal
        isOpen={addTaskModal}
        onClose={() => setAddTaskModal(false)}
        onAdd={handleAddTask}
        boardType={activeBoard === 'technicalSEO' ? 'Technical SEO' : activeBoard === 'cro' ? 'CRO' : 'Strategy / Ad Hoc'}
      />
    </DashboardLayout>
  );
}
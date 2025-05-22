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
function PriorityBadge({ priority, originalPriority }: { priority: TaskPriority, originalPriority?: string }) {
  let bgColor = '';
  let textColor = '';

  switch (priority) {
    case 'High':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    case 'Medium':
      bgColor = 'bg-gold/10';
      textColor = 'text-gold';
      break;
    case 'Low':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    default:
      bgColor = 'bg-lightGray';
      textColor = 'text-mediumGray';
  }

  // Display the original Airtable value if available
  const displayText = originalPriority || priority;

  return (
    <span className={`px-3 py-1 text-base font-medium rounded-lg inline-flex items-center justify-center ${bgColor} ${textColor}`}>
      {displayText}
    </span>
  );
}

// Impact Badge Component
function ImpactBadge({ impact, originalImpact }: { impact: number, originalImpact?: string }) {
  let bgColor = '';
  let textColor = '';

  switch (impact) {
    case 5:
      bgColor = 'bg-gray-200';
      textColor = 'text-gray-800';
      break;
    case 4:
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 3:
      bgColor = 'bg-indigo-100';
      textColor = 'text-indigo-800';
      break;
    case 2:
      bgColor = 'bg-teal-100';
      textColor = 'text-teal-800';
      break;
    case 1:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      break;
    default:
      bgColor = 'bg-lightGray';
      textColor = 'text-mediumGray';
  }

  // Display the original Airtable value if available
  const displayText = originalImpact || impact.toString();

  return (
    <span className={`min-w-8 h-8 px-2 text-base font-medium rounded-lg inline-flex items-center justify-center ${bgColor} ${textColor}`}>
      {displayText}
    </span>
  );
}

// Effort Badge Component
function EffortBadge({ effort, originalEffort }: { effort: TaskEffort, originalEffort?: string }) {
  let bgColor = '';
  let textColor = '';

  switch (effort) {
    case 'S':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'M':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'L':
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-800';
      break;
    default:
      bgColor = 'bg-lightGray';
      textColor = 'text-mediumGray';
  }

  // Display the original Airtable value if available
  const displayText = originalEffort || effort;

  return (
    <span className={`min-w-8 h-8 px-2 text-base font-medium rounded-lg inline-flex items-center justify-center ${bgColor} ${textColor}`}>
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
    <span className={`px-3 py-1 text-base font-medium rounded-lg inline-flex items-center justify-center ${bgColor} ${textColor}`}>
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
        <div className="flex space-x-2">
          <PriorityBadge priority={task.priority} originalPriority={task.originalPriority} />
          <StatusBadge status={task.status} />
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

      <div className="flex items-center space-x-5 mb-5">
        <div>
          <span className="text-base text-mediumGray dark:text-gray-300 block mb-2">Impact</span>
          <ImpactBadge impact={task.impact} originalImpact={task.originalImpact} />
        </div>
        <div>
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
    const priorityOrder = {
      'High': 1,
      'Medium': 2,
      'Low': 3
    };

    const priorityComparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityComparison !== 0) return priorityComparison;

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
              <th className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider w-[10%]">Status</th>
              <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[15%]">Assigned to</th>
              <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[12%]">Date Logged</th>
              <th className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider w-[10%]">Priority</th>
              <th className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider w-[8%]">Impact</th>
              <th className="px-4 py-4 text-center text-base font-bold text-black uppercase tracking-wider w-[5%]">Effort</th>
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
                  <td className="px-4 py-4 text-center w-[10%]">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-4 text-base text-dark w-[15%]">{task.assignedTo}</td>
                  <td className="px-4 py-4 text-base text-mediumGray w-[12%] whitespace-nowrap">{task.dateLogged}</td>
                  <td className="px-4 py-4 text-center w-[10%]">
                    <PriorityBadge priority={task.priority} originalPriority={task.originalPriority} />
                  </td>
                  <td className="px-4 py-4 text-center w-[8%]">
                    <ImpactBadge impact={task.impact} originalImpact={task.originalImpact} />
                  </td>
                  <td className="px-4 py-4 text-center w-[5%]">
                    <EffortBadge effort={task.effort} originalEffort={task.originalEffort} />
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
  onAdd: (task: Task) => void;
  boardType: string;
}) {
  // Define a type for the form data
  type TaskFormData = {
    task: string;
    priority: TaskPriority;
    assignedTo: string;
    impact: number;
    effort: TaskEffort;
    notes: string;
    referenceLinks: string; // String for the form, will be converted to string[] when submitting
  };

  const [taskData, setTaskData] = useState<TaskFormData>({
    task: '',
    priority: 'Medium',
    assignedTo: '',
    impact: 3,
    effort: 'M',
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

      // Create a task object with the correct type
      const newTask: Task = {
        task: taskData.task,
        priority: taskData.priority,
        assignedTo: taskData.assignedTo.trim() || 'Unassigned',
        impact: taskData.impact,
        effort: taskData.effort,
        notes: taskData.notes,
        id: Date.now(),
        status: 'Not Started',
        dateLogged: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        comments: [],
        referenceLinks: referenceLinks
      };

      onAdd(newTask);

      // Reset form
      setTaskData({
        task: '',
        priority: 'Medium',
        assignedTo: '',
        impact: 3,
        effort: 'M',
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
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-mediumGray mb-2">Impact (1-5)</label>
              <select
                className="w-full border border-gray-200 rounded-[12px] p-3 focus:outline-none focus:ring-2 focus:ring-[#000000]"
                value={taskData.impact}
                onChange={(e) => setTaskData({ ...taskData, impact: parseInt(e.target.value) })}
              >
                <option value="1">1 (Minimal)</option>
                <option value="2">2 (Low)</option>
                <option value="3">3 (Medium)</option>
                <option value="4">4 (High)</option>
                <option value="5">5 (Critical)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-mediumGray mb-2">Effort</label>
              <select
                className="w-full border border-gray-200 rounded-[12px] p-3 focus:outline-none focus:ring-2 focus:ring-[#000000]"
                value={taskData.effort}
                onChange={(e) => setTaskData({ ...taskData, effort: e.target.value as TaskEffort })}
              >
                <option value="S">Small</option>
                <option value="M">Medium</option>
                <option value="L">Large</option>
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

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasksForBoard = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch tasks based on the active board type
        let response;
        if (activeBoard === 'cro') {
          // Use CRO-specific API for CRO board with useCache set to false to always get fresh data
          response = await getCROTasks(false);
        } else {
          // Use WQA API for other boards
          response = await fetchWQATasks(activeBoard);
        }
        
        console.log(`${activeBoard} Tasks Response:`, response);
        
        // Extract tasks from the response - handle different possible response formats
        let tasks: any[] = [];
        if (response) {
          if (Array.isArray(response)) {
            // Response is already an array of tasks
            tasks = response;
          } else if (typeof response === 'object' && response !== null) {
            // Check if response has a tasks property that is an array
            if ('tasks' in response && Array.isArray((response as any).tasks)) {
              tasks = (response as any).tasks;
            } else {
              // Treat the entire response as a single task if it's not in expected format
              tasks = [response];
            }
          }
        }
        
        // Map the Airtable tasks to our Task type
        const mappedTasks = Array.isArray(tasks) ? tasks.map((task: any) => {
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
            Client: client
          } = task;
          
          // Process comments if they exist
          let processedComments: any[] = [];
          if (comments) {
            if (Array.isArray(comments)) {
              // If comments is an array of objects with proper structure
              processedComments = comments.map((comment: any, index: number) => {
                if (typeof comment === 'object' && comment !== null) {
                  return {
                    id: comment.id || `comment-${index}`,
                    author: comment.author || comment.User || 'User',
                    text: comment.text || comment.Comment || comment.toString(),
                    timestamp: comment.timestamp || comment.CreatedAt || new Date().toLocaleDateString()
                  };
                } else {
                  // If comment is just a string or primitive
                  return {
                    id: `comment-${index}`,
                    author: 'User',
                    text: comment.toString(),
                    timestamp: new Date().toLocaleDateString()
                  };
                }
              });
            } else if (typeof comments === 'object' && comments !== null) {
              // If it's a single comment object
              processedComments = [{
                id: comments.id || 'comment-1',
                author: comments.author || comments.User || 'User',
                text: comments.text || comments.Comment || comments.toString(),
                timestamp: comments.timestamp || comments.CreatedAt || new Date().toLocaleDateString()
              }];
            } else if (typeof comments === 'string') {
              // If it's a string - might be a newline-separated list of comments in the long text field
              // Split by double newlines to separate different comments
              const commentBlocks = comments.split('\n\n')
                .filter(block => block.trim().length > 0);
              
              // Parse each comment block
              processedComments = commentBlocks.map((block, index) => {
                // Split the first line from the rest of the comment
                const lines = block.split('\n');
                
                // First line should contain username and date
                const headerLine = lines[0] || '';
                
                // Try to extract username and date
                let author = 'User';
                let timestamp = new Date().toLocaleDateString();
                
                // Try to parse the header line
                const headerMatch = headerLine.match(/^(.+?)\s+(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\/\d{1,2}\/\d{2})$/);
                if (headerMatch) {
                  author = headerMatch[1].trim();
                  timestamp = headerMatch[2].trim();
                }
                
                // The rest of the lines make up the comment text
                const commentText = lines.slice(1).join('\n').trim();
                
                return {
                  id: `comment-${id}-${index}`,
                  author,
                  text: commentText || headerLine, // If parsing failed, use the whole line as text
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
            // Use actual values from Airtable for priority, impact, and effort
            priority: priority ? (priority as TaskPriority) : 'Medium',
            impact: impact !== undefined && impact !== null ? 
              (typeof impact === 'number' ? impact : 
                (typeof impact === 'string' ? parseInt(impact, 10) || 3 : 3)) : 3,
            effort: effort ? (effort as TaskEffort) : 'M',
            comments: processedComments,
            // Use the commentCount from the API response if available
            commentCount: commentCount !== undefined ? commentCount : processedComments.length,
            notes: notes || '',
            // Add Client field to task (for filtering)
            Client: client
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
        }) : [];
        
        // Store the raw (unfiltered) tasks
        setRawBoards(prev => {
          const newBoards = { ...prev };
          newBoards[activeBoard as keyof typeof boards] = mappedTasks;
          return newBoards;
        });
        
        // Apply client filtering to the tasks and update the boards state
        filterTasks(mappedTasks);
      } catch (err: any) {
        console.error('Error fetching tasks:', err);
        setError(`An error occurred while fetching tasks: ${err.message}`);

        // Fall back to sample data
        console.log('Error occurred, falling back to sample data');
        setRawBoards(taskBoards);
        setBoards(taskBoards);
      } finally {
        setLoading(false);
      }
    };

    fetchTasksForBoard();
  }, [activeBoard]);

  // Apply client filtering when clientId changes
  useEffect(() => {
    const currentRawTasks = rawBoards[activeBoard as keyof typeof rawBoards] || [];
    filterTasks(currentRawTasks);
  }, [clientId, activeBoard, rawBoards]);

  // Function to apply client filtering to tasks
  const filterTasks = (tasks: Task[]) => {
    // Apply client filtering
    const filteredTasks = filterDataByClient(tasks) as Task[];
    
    // Update the boards state with filtered tasks
    setBoards(prev => {
      const newBoards = { ...prev };
      newBoards[activeBoard as keyof typeof boards] = filteredTasks;
      return newBoards;
    });
  };

  // Function to refresh task data
  const refreshData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch tasks based on the active board type
      let response;
      if (activeBoard === 'cro') {
        // Use CRO-specific API for CRO board with useCache set to false to always get fresh data
        response = await getCROTasks(false);
      } else {
        // Use WQA API for other boards
        response = await fetchWQATasks(activeBoard);
      }
      
      console.log(`${activeBoard} Tasks Response:`, response);
      
      // Extract tasks from the response - handle different possible response formats
      let tasks: any[] = [];
      if (response) {
        if (Array.isArray(response)) {
          // Response is already an array of tasks
          tasks = response;
        } else if (typeof response === 'object' && response !== null) {
          // Check if response has a tasks property that is an array
          if ('tasks' in response && Array.isArray((response as any).tasks)) {
            tasks = (response as any).tasks;
          }
        }
      }
      
      console.log('Parsed tasks:', tasks);
      
      // Update both raw and filtered boards
      const tasksForBoard = {
        technicalSEO: [] as Task[],
        cro: [] as Task[],
        strategyAdHoc: [] as Task[]
      };
      
      // Group tasks by type and map to the correct format
      tasks.forEach((task: any) => {
        // Map the Airtable fields to our Task type
        const mappedTask = mapAirtableTaskToTask({
          id: task.id,
          Name: task.Name,
          Title: task.Title, // Fallback to Title if Name is not available
          Description: task.Notes || task.Description,
          Status: task.Status,
          Priority: task.Priority,
          AssignedTo: task['Assigned To'] || task.AssignedTo,
          Category: task.Category,
          Type: task.Type,
          'Impact Level': task['Impact Level'],
          'Effort Level': task['Effort Level'],
          'Created At': task['Created At'],
          'Due Date': task['Due Date'],
          'Completed Date': task['Completed Date'],
          Notes: task.Notes
        });
        
        // Add the task to the appropriate board
        if (task.Type === 'Technical SEO' || task.Type === 'WQA') {
          tasksForBoard.technicalSEO.push(mappedTask);
        } else if (task.Type === 'CRO') {
          tasksForBoard.cro.push(mappedTask);
        } else {
          tasksForBoard.strategyAdHoc.push(mappedTask);
        }
      });
      
      setRawBoards(prev => ({
        ...prev,
        ...tasksForBoard
      }));
      
      // Apply client filtering
      if (clientId) {
        // Filter tasks by client
        const filteredTasksArray = filterTasks(tasks);
        const filteredTasksForBoard = {
          technicalSEO: [] as Task[],
          cro: [] as Task[],
          strategyAdHoc: [] as Task[]
        };
        
        // Group filtered tasks by type
        if (Array.isArray(filteredTasksArray)) {
          filteredTasksArray.forEach((task: any) => {
            // Map the Airtable fields to our Task type
            const mappedTask = mapAirtableTaskToTask({
              id: task.id,
              Name: task.Name,
              Title: task.Title, // Fallback to Title if Name is not available
              Description: task.Notes || task.Description,
              Status: task.Status,
              Priority: task.Priority,
              AssignedTo: task['Assigned To'] || task.AssignedTo,
              Category: task.Category,
              Type: task.Type,
              'Impact Level': task['Impact Level'],
              'Effort Level': task['Effort Level'],
              'Created At': task['Created At'],
              'Due Date': task['Due Date'],
              'Completed Date': task['Completed Date'],
              Notes: task.Notes
            });
            
            if (task.Type === 'Technical SEO' || task.Type === 'WQA') {
              filteredTasksForBoard.technicalSEO.push(mappedTask);
            } else if (task.Type === 'CRO') {
              filteredTasksForBoard.cro.push(mappedTask);
            } else {
              filteredTasksForBoard.strategyAdHoc.push(mappedTask);
            }
          });
        }
        
        setBoards(prev => ({
          ...prev,
          ...filteredTasksForBoard
        }));
      } else {
        setBoards(prev => ({
          ...prev,
          ...tasksForBoard
        }));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks. Please try again.');
      setLoading(false);
    }
  };

  const handleAddTask = async (task: Task) => {
    try {
      setLoading(true);
      
      let newTask;
      
      // Call the appropriate API based on the active board
      if (activeBoard === 'cro') {
        // Use CRO-specific API for CRO board
        newTask = await createCROTask({
          task: task.task,
          status: task.status,
          priority: task.priority,
          assignedTo: task.assignedTo && task.assignedTo !== 'Unassigned' ? task.assignedTo : '',
          impact: task.impact,
          effort: task.effort,
          notes: task.notes
        });
      } else {
        // Use WQA API for other boards
        newTask = await createWQATask({
          task: task.task,
          status: task.status,
          priority: task.priority,
          assignedTo: task.assignedTo && task.assignedTo !== 'Unassigned' ? task.assignedTo : '',
          impact: task.impact,
          effort: task.effort,
          notes: task.notes,
          boardType: activeBoard
        });
      }
      
      console.log('Created new task:', newTask);
      
      // Base properties for task object
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
        commentCount: newTask.commentCount || 0
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
        newBoards[activeBoard as keyof typeof boards] = [
          ...newBoards[activeBoard as keyof typeof boards],
          createdTask
        ];
        return newBoards;
      });
      
      // Also add to filtered boards
      setBoards(prev => {
        const newBoards = { ...prev };
        newBoards[activeBoard as keyof typeof boards] = [
          ...newBoards[activeBoard as keyof typeof boards],
          createdTask
        ];
        return newBoards;
      });
      
      setAddTaskModal(false);
      setLoading(false);
      
      // Refresh the task list to ensure we have the latest data
      refreshData();
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task. Please try again.');
      setLoading(false);
      
      // Still update the UI for better UX
      setRawBoards(prev => {
        const newBoards = { ...prev };
        newBoards[activeBoard as keyof typeof boards] = [
          ...newBoards[activeBoard as keyof typeof boards],
          task
        ];
        return newBoards;
      });
      
      // Also add to filtered boards
      setBoards(prev => {
        const newBoards = { ...prev };
        newBoards[activeBoard as keyof typeof boards] = [
          ...newBoards[activeBoard as keyof typeof boards],
          task
        ];
        return newBoards;
      });

      setAddTaskModal(false);
    }
  };

  // Get the current board's tasks
  const currentTasks = boards[activeBoard as keyof typeof boards] || [];

  const handleStatusChange = async (id: number | string, newStatus: TaskStatus) => {
    try {
      console.log(`Updating task ${id} status to ${newStatus}`);
      
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
        case 'Done':
          airtableStatus = 'Setup';
          break;
        default:
          airtableStatus = 'To Do';
      }
      
      // Update task status using the appropriate API based on the active board
      if (activeBoard === 'cro') {
        // Use CRO-specific API for CRO board
        await updateCROTaskStatus(id.toString(), airtableStatus);
      } else {
        // Use WQA API for other boards
        await updateWQATaskStatus(id.toString(), airtableStatus);
      }
      
      console.log(`Task ${id} status updated successfully`);
      
      // Update local state with frontend status
      setBoards(prev => {
        const newBoards = { ...prev };
        const taskIndex = newBoards[activeBoard as keyof typeof boards].findIndex(task =>
          task.id === id || task.id.toString() === id.toString()
        );

        if (taskIndex !== -1) {
          const currentTask = newBoards[activeBoard as keyof typeof boards][taskIndex];

          if (newStatus === 'Done') {
            // When moving to Done, add completedDate
            const updatedTask = {
              ...currentTask,
              status: newStatus,
              completedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            } as CompletedTask;
            newBoards[activeBoard as keyof typeof boards][taskIndex] = updatedTask;
          } else {
            // When moving to other statuses
            const updatedTask = {
              ...currentTask,
              status: newStatus,
              completedDate: undefined
            } as ActiveTask;
            newBoards[activeBoard as keyof typeof boards][taskIndex] = updatedTask;
          }
        } else {
          console.warn(`Task with ID ${id} not found in ${activeBoard} board`);
        }

        return newBoards;
      });
      
      // Also update the raw boards state
      setRawBoards(prev => {
        const newBoards = { ...prev };
        const taskIndex = newBoards[activeBoard as keyof typeof boards].findIndex(task =>
          task.id === id || task.id.toString() === id.toString()
        );

        if (taskIndex !== -1) {
          const currentTask = newBoards[activeBoard as keyof typeof boards][taskIndex];

          if (newStatus === 'Done') {
            // When moving to Done, add completedDate
            const updatedTask = {
              ...currentTask,
              status: newStatus,
              completedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            } as CompletedTask;
            newBoards[activeBoard as keyof typeof boards][taskIndex] = updatedTask;
          } else {
            // When moving to other statuses
            const updatedTask = {
              ...currentTask,
              status: newStatus,
              completedDate: undefined
            } as ActiveTask;
            newBoards[activeBoard as keyof typeof boards][taskIndex] = updatedTask;
          }
        }

        return newBoards;
      });
    } catch (err) {
      console.error('Error updating task status:', err);

      // Update local state anyway for better UX
      setBoards(prev => {
        const newBoards = { ...prev };
        const taskIndex = newBoards[activeBoard as keyof typeof boards].findIndex(task =>
          task.id === id || task.id.toString() === id.toString()
        );

        if (taskIndex !== -1) {
          const currentTask = newBoards[activeBoard as keyof typeof boards][taskIndex];

          if (newStatus === 'Done') {
            // When moving to Done, add completedDate
            const updatedTask = {
              ...currentTask,
              status: newStatus,
              completedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            } as CompletedTask;
            newBoards[activeBoard as keyof typeof boards][taskIndex] = updatedTask;
          } else {
            // When moving to other statuses
            const updatedTask = {
              ...currentTask,
              status: newStatus,
              completedDate: undefined
            } as ActiveTask;
            newBoards[activeBoard as keyof typeof boards][taskIndex] = updatedTask;
          }
        } else {
          console.warn(`Task with ID ${id} not found in ${activeBoard} board`);
        }

        return newBoards;
      });
      
      // Also update the raw boards state
      setRawBoards(prev => {
        const newBoards = { ...prev };
        const taskIndex = newBoards[activeBoard as keyof typeof boards].findIndex(task =>
          task.id === id || task.id.toString() === id.toString()
        );

        if (taskIndex !== -1) {
          const currentTask = newBoards[activeBoard as keyof typeof boards][taskIndex];

          if (newStatus === 'Done') {
            // When moving to Done, add completedDate
            const updatedTask = {
              ...currentTask,
              status: newStatus,
              completedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            } as CompletedTask;
            newBoards[activeBoard as keyof typeof boards][taskIndex] = updatedTask;
          } else {
            // When moving to other statuses
            const updatedTask = {
              ...currentTask,
              status: newStatus,
              completedDate: undefined
            } as ActiveTask;
            newBoards[activeBoard as keyof typeof boards][taskIndex] = updatedTask;
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

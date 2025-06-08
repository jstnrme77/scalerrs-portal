import { useDrop } from 'react-dnd';
import RedditCard from './RedditCard';
import { Reddit, RedditStatus } from '@/types';
import { ItemTypes } from '@/constants/DragTypes';

interface RedditColumnProps {
  title: string;
  status: RedditStatus;
  threads: Reddit[];
  selectedMonth: string;
  bgColor: string;
  count?: number;
  onStatusChange: (id: string, newStatus: RedditStatus) => void;
  hideActions?: boolean;
  onViewDocument?: (url: string, title: string) => void;
}

export default function RedditColumn({
  title,
  status,
  threads,
  selectedMonth,
  bgColor,
  count,
  onStatusChange,
  hideActions = false,
  onViewDocument
}: RedditColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.REDDIT_CARD,
    drop: (item: { id: string }) => {
      onStatusChange(item.id, status);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Define background colors for different statuses
  const getStatusColor = () => {
    switch (status) {
      case 'Thread Proposed':
        return 'bg-gray-50 border-gray-200';
      case 'Thread Awaiting Internal Approval (Scalerrs)':
        return 'bg-yellow-50 border-yellow-200';
      case 'Thread Awaiting Client Approval (Client)':
        return 'bg-orange-50 border-orange-200';
      case 'Thread Approved':
        return 'bg-green-50 border-green-200';
      case 'Thread To Do Next (External)':
        return 'bg-blue-50 border-blue-200';
      case 'Thread In Process (External)':
        return 'bg-indigo-50 border-indigo-200';
      case 'Thread Done':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const statusColor = getStatusColor();

  // Define header background colors for different statuses
  const getHeaderBgColor = () => {
    switch (status) {
      case 'Thread Proposed':
        return 'bg-gray-100';
      case 'Thread Awaiting Internal Approval (Scalerrs)':
        return 'bg-yellow-100';
      case 'Thread Awaiting Client Approval (Client)':
        return 'bg-orange-100';
      case 'Thread Approved':
        return 'bg-green-100';
      case 'Thread To Do Next (External)':
        return 'bg-blue-100';
      case 'Thread In Process (External)':
        return 'bg-indigo-100';
      case 'Thread Done':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };

  const headerBgColor = getHeaderBgColor();

  return (
    <div
      ref={drop as any}
      className={`w-[500px] rounded-lg ${isOver ? 'ring-2 ring-primary' : ''} border ${statusColor}`}
    >
      <div className="flex flex-col">
        <div className={`${headerBgColor} rounded-t-lg kanban-column-header`}>
          <h3 className="truncate">
            {title}
          </h3>
          <span className="count-badge">
            {count !== undefined ? count : threads.length}
          </span>
        </div>
      </div>

      <div className={`${statusColor} rounded-b-lg p-3`}>
        {threads.map((thread) => (
          <RedditCard
            key={thread.id}
            thread={thread}
            selectedMonth={selectedMonth}
            onStatusChange={onStatusChange}
            hideActions={hideActions}
            onViewDocument={onViewDocument}
          />
        ))}

        {threads.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">
              {status === 'Thread Proposed' ? (
                "No threads in proposed status"
              ) : status === 'Thread Awaiting Internal Approval (Scalerrs)' ? (
                "No threads awaiting internal approval"
              ) : status === 'Thread Awaiting Client Approval (Client)' ? (
                "No threads awaiting client approval"
              ) : status === 'Thread Approved' ? (
                "No threads with approved status"
              ) : status === 'Thread To Do Next (External)' ? (
                "No threads in to-do next status"
              ) : status === 'Thread In Process (External)' ? (
                "No threads in process"
              ) : status === 'Thread Done' ? (
                "No threads in done status"
              ) : (
                `No threads in ${status} status`
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 
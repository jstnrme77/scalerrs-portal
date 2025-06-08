import { useDrop } from 'react-dnd';
import YouTubeCard from './YouTubeCard';
import { YouTube, YouTubeStatus } from '@/types';
import { ItemTypes } from '@/constants/DragTypes';

interface YouTubeColumnProps {
  title: string;
  status: YouTubeStatus;
  videos: YouTube[];
  selectedMonth: string;
  bgColor: string;
  count?: number;
  onStatusChange: (id: string, newStatus: YouTubeStatus) => void;
  hideActions?: boolean;
  onViewDocument?: (url: string, title: string) => void;
}

export default function YouTubeColumn({
  title,
  status,
  videos,
  selectedMonth,
  bgColor,
  count,
  onStatusChange,
  hideActions = false,
  onViewDocument
}: YouTubeColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.YOUTUBE_CARD,
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
      // Idea stage
      case 'Idea Proposed':
        return 'bg-gray-50 border-gray-200';
      case 'Idea Awaiting Client Approval':
        return 'bg-yellow-50 border-yellow-200';
      case 'Idea Approved':
        return 'bg-green-50 border-green-200';
      case 'Idea To Do Next':
        return 'bg-blue-50 border-blue-200';

      // Script stage
      case 'Script Creation Needed':
        return 'bg-orange-50 border-orange-200';
      case 'Script Under Internal Review':
        return 'bg-indigo-50 border-indigo-200';
      case 'Script Awaiting Client Depth':
        return 'bg-purple-50 border-purple-200';
      case 'Script Needs Revision':
        return 'bg-red-50 border-red-200';
      case 'Script Approved':
        return 'bg-green-50 border-green-200';

      // Production stage
      case 'Video In Recording':
        return 'bg-yellow-50 border-yellow-200';
      case 'Video In Editing':
        return 'bg-orange-50 border-orange-200';
      case 'Video Ready':
        return 'bg-green-50 border-green-200';

      // Thumbnail stage
      case 'Thumbnail In Creation':
        return 'bg-pink-50 border-pink-200';
      case 'Thumbnail Done':
        return 'bg-green-50 border-green-200';

      // Final stages
      case 'Ready To Upload':
        return 'bg-blue-50 border-blue-200';

      default:
        return 'bg-white border-gray-200';
    }
  };

  const statusColor = getStatusColor();

  // Define header background colors for different statuses
  const getHeaderBgColor = () => {
    switch (status) {
      // Idea stage
      case 'Idea Proposed':
        return 'bg-gray-100';
      case 'Idea Awaiting Client Approval':
        return 'bg-yellow-100';
      case 'Idea Approved':
        return 'bg-green-100';
      case 'Idea To Do Next':
        return 'bg-blue-100';

      // Script stage
      case 'Script Creation Needed':
        return 'bg-orange-100';
      case 'Script Under Internal Review':
        return 'bg-indigo-100';
      case 'Script Awaiting Client Depth':
        return 'bg-purple-100';
      case 'Script Needs Revision':
        return 'bg-red-100';
      case 'Script Approved':
        return 'bg-green-100';

      // Production stage
      case 'Video In Recording':
        return 'bg-yellow-100';
      case 'Video In Editing':
        return 'bg-orange-100';
      case 'Video Ready':
        return 'bg-green-100';

      // Thumbnail stage
      case 'Thumbnail In Creation':
        return 'bg-pink-100';
      case 'Thumbnail Done':
        return 'bg-green-100';

      // Final stages
      case 'Ready To Upload':
        return 'bg-blue-100';

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
            {count !== undefined ? count : videos.length}
          </span>
        </div>
      </div>

      <div className={`${statusColor} rounded-b-lg p-3`}>
        {videos.map((video) => (
          <YouTubeCard
            key={video.id}
            video={video}
            selectedMonth={selectedMonth}
            onStatusChange={onStatusChange}
            hideActions={hideActions}
            onViewDocument={onViewDocument}
          />
        ))}

        {videos.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">
              {status === 'Idea Proposed' ? (
                "No videos in idea proposed status"
              ) : status === 'Idea Awaiting Client Approval' ? (
                "No videos in idea awaiting client approval status"
              ) : status === 'Idea Approved' ? (
                "No videos with approved ideas"
              ) : status === 'Script Creation Needed' ? (
                "No videos need script creation"
              ) : status === 'Script Under Internal Review' ? (
                "No scripts under internal review"
              ) : status === 'Script Awaiting Client Depth' ? (
                "No scripts awaiting client depth"
              ) : status === 'Video In Recording' ? (
                "No videos currently in recording"
              ) : status === 'Video Ready' ? (
                "No videos ready for next steps"
              ) : (
                `No videos in ${status.toLowerCase()} status`
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 
import { useDrop } from 'react-dnd';
import { ItemTypes } from '@/constants/DragTypes';
import BriefCard from './BriefCard';
import { Brief, BriefStatus } from '@/types';

interface BriefColumnProps {
  title: string;
  status: BriefStatus;
  briefs: Brief[];
  selectedMonth: string;
  bgColor: string;
  count?: number;
  onStatusChange: (id: string, newStatus: BriefStatus) => void;
  hideActions?: boolean;
  onViewDocument?: (url: string, title: string) => void;
}

export default function BriefColumn({
  title,
  status,
  briefs,
  selectedMonth,
  bgColor,
  count,
  onStatusChange,
  hideActions = false,
  onViewDocument
}: BriefColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.BRIEF_CARD,
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
      // Creation stage
      case 'Brief Creation Needed':
      case 'New':
      case 'Refresh':
      case 'In Progress':
        return 'bg-yellow-50 border-yellow-200';

      // Review stages
      case 'Brief Under Internal Review':
      case 'Review Brief':
        return 'bg-indigo-50 border-indigo-200';

      case 'Brief Awaiting Client Depth':
        return 'bg-purple-50 border-purple-200';

      case 'Brief Awaiting Client Review':
      case 'Needs Review':
        return 'bg-blue-50 border-blue-200';

      // Revision stage
      case 'Brief Needs Revision':
      case 'Needs Input':
        return 'bg-orange-50 border-orange-200';

      // Approval stage
      case 'Brief Approved':
        return 'bg-green-50 border-green-200';

      default:
        return 'bg-white border-gray-200';
    }
  };

  const statusColor = getStatusColor();

  // Define header background colors for different statuses
  const getHeaderBgColor = () => {
    switch (status) {
      // Creation stage
      case 'Brief Creation Needed':
      case 'New':
      case 'Refresh':
      case 'In Progress':
        return 'bg-yellow-100';

      // Review stages
      case 'Brief Under Internal Review':
      case 'Review Brief':
        return 'bg-indigo-100';

      case 'Brief Awaiting Client Depth':
        return 'bg-purple-100';

      case 'Brief Awaiting Client Review':
      case 'Needs Review':
        return 'bg-blue-100';

      // Revision stage
      case 'Brief Needs Revision':
      case 'Needs Input':
        return 'bg-orange-100';

      // Approval stage
      case 'Brief Approved':
        return 'bg-green-100';

      default:
        return 'bg-gray-100';
    }
  };

  const headerBgColor = getHeaderBgColor();

  return (
    <div
      ref={drop as any}
      className={`w-full rounded-lg ${isOver ? 'ring-2 ring-primary' : ''} border ${statusColor}`}
    >
      <div className="flex flex-col">
        <div className={`flex items-center justify-between px-3 py-2 ${headerBgColor} rounded-t-lg`}>
          <h3 className="text-sm font-medium">
            {title}
          </h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-white bg-opacity-60 rounded">
            {count !== undefined ? count : briefs.length}
          </span>
        </div>
        <div className="h-px bg-gray-200 w-full mt-1"></div>
      </div>

      <div className={`${statusColor} rounded-b-lg p-3 mt-2`}>
        {briefs.map((brief) => (
          <BriefCard
            key={brief.id}
            brief={brief}
            selectedMonth={selectedMonth}
            onStatusChange={onStatusChange}
            hideActions={hideActions}
            onViewDocument={onViewDocument}
          />
        ))}

        {briefs.length === 0 && (
          <div className="p-4 text-center">
            {status === 'Brief Creation Needed' ? (
              <p className="text-sm text-gray-500">No briefs currently need creation</p>
            ) : status === 'Brief Under Internal Review' ? (
              <p className="text-sm text-gray-500">No briefs currently under internal review</p>
            ) : status === 'Brief Awaiting Client Depth' ? (
              <p className="text-sm text-gray-500">No briefs currently awaiting client depth</p>
            ) : status === 'Brief Awaiting Client Review' ? (
              <p className="text-sm text-gray-500">No briefs currently awaiting client review</p>
            ) : status === 'Brief Needs Revision' ? (
              <p className="text-sm text-gray-500">No briefs currently need revision</p>
            ) : status === 'Brief Approved' ? (
              <p className="text-sm text-gray-500">No briefs currently approved</p>
            ) : (
              <p className="text-sm text-gray-500">No items in {status.toLowerCase()} status</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

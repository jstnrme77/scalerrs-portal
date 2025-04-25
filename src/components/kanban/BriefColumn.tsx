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
}

export default function BriefColumn({
  title,
  status,
  briefs,
  selectedMonth,
  bgColor,
  count,
  onStatusChange
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

  return (
    <div
      ref={drop as any}
      className={`w-full rounded-lg ${isOver ? 'ring-2 ring-primary' : ''}`}
    >
      <div className={`flex items-center justify-between px-3 py-2 ${bgColor} rounded-t-lg`}>
        <h3 className="text-sm font-medium">
          {title}
        </h3>
        <span className="px-2 py-0.5 text-xs font-medium bg-white bg-opacity-60 rounded">
          {count !== undefined ? count : briefs.length}
        </span>
      </div>

      <div className="bg-white rounded-b-lg p-0 mt-3 space-y-1">
        {briefs.map((brief) => (
          <BriefCard
            key={brief.id}
            brief={brief}
            selectedMonth={selectedMonth}
            onStatusChange={onStatusChange}
          />
        ))}

        {briefs.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">No items currently need {status.toLowerCase()}</p>
          </div>
        )}
      </div>
    </div>
  );
}

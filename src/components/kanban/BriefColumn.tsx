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
  onStatusChange: (id: number, newStatus: BriefStatus) => void;
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
    drop: (item: { id: number }) => {
      onStatusChange(item.id, status);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop as any}
      className={`bg-white p-0 rounded-lg ${isOver ? 'ring-1 ring-primary' : ''}`}
    >
      <div className={`flex items-center justify-between px-3 py-2 border-b border-gray-100 ${bgColor}`}>
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          {title}
        </h3>
        <span className="px-1.5 py-0.5 text-xs font-medium bg-white bg-opacity-60 rounded text-gray-700">
          {count !== undefined ? count : briefs.length}
        </span>
      </div>

      <div className="p-3 space-y-3">
        {briefs.map((brief) => (
          <BriefCard
            key={brief.id}
            brief={brief}
            selectedMonth={selectedMonth}
          />
        ))}

        {briefs.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-400">No items</p>
          </div>
        )}
      </div>
    </div>
  );
}

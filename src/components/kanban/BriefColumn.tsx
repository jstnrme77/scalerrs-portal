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
  onStatusChange: (id: number, newStatus: BriefStatus) => void;
}

export default function BriefColumn({
  title,
  status,
  briefs,
  selectedMonth,
  bgColor,
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
      className={`${bgColor} p-4 rounded-lg shadow-sm border border-lightGray ${isOver ? 'ring-2 ring-primary' : ''}`}
    >
      <h3 className="text-md font-medium text-dark mb-4 flex items-center">
        {title}
        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-white rounded-full text-mediumGray">
          {briefs.length}
        </span>
      </h3>

      <div className="space-y-3">
        {briefs.map((brief) => (
          <BriefCard
            key={brief.id}
            brief={brief}
            selectedMonth={selectedMonth}
          />
        ))}

        {briefs.length === 0 && (
          <div className="bg-white p-4 rounded-lg border border-dashed border-lightGray text-center">
            <p className="text-sm text-mediumGray">No briefs</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useDrag } from 'react-dnd';
import { ItemTypes } from '@/constants/DragTypes';
import { Brief } from '@/types';

interface BriefCardProps {
  brief: Brief;
  selectedMonth: string;
}

export default function BriefCard({ brief, selectedMonth }: BriefCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.BRIEF_CARD,
    item: { id: brief.id, status: brief.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as any}
      className={`card bg-white p-4 rounded-lg border border-lightGray shadow-sm ${isDragging ? 'opacity-50' : ''}`}
      style={{ cursor: 'move', color: '#353233' }}
    >
      <h4 className="font-medium text-text-light dark:text-text-dark mb-2">{brief.title}</h4>
      <div className="flex items-center text-xs text-mediumGray dark:text-gray-300 mb-2">
        <span className="mr-2">Due {brief.dueDate}</span>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs bg-[#e9ecef] dark:bg-darkGray px-2 py-1 rounded text-mediumGray dark:text-gray-300">{selectedMonth}</span>
        <a
          href={brief.docLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          View Doc
        </a>
      </div>
      <div className="flex items-center mt-3 pt-3 border-t border-lightGray dark:border-container">
        <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs text-white">
          {brief.seoStrategist.split(' ').map(name => name[0]).join('')}
        </div>
        <span className="text-xs ml-2">{brief.seoStrategist}</span>
      </div>
    </div>
  );
}

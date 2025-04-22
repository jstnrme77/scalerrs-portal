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

  // Determine if the card should show priority styling
  const isPriority = brief.status === 'Review Brief';
  const isOverdue = new Date(brief.dueDate) < new Date();

  // Determine card color based on status
  let cardBgColor = '';
  let priorityLabel = '';

  if (brief.status === 'Review Brief') {
    cardBgColor = 'bg-[#f9f0ff]';
    priorityLabel = 'Hot Brief';
  } else if (brief.status === 'In Progress') {
    cardBgColor = 'bg-[#f0f4ff]';
  } else if (brief.status === 'Brief Approved') {
    cardBgColor = 'bg-[#f0fff4]';
  }

  return (
    <div
      ref={drag as any}
      className={`p-4 rounded-lg border border-gray-100 ${isDragging ? 'opacity-50' : ''} ${cardBgColor || 'bg-white'}`}
      style={{ cursor: 'move' }}
    >
      {/* Priority indicator */}
      {isPriority && (
        <div className="mb-2">
          {isOverdue ? (
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">Overdue</span>
          ) : (
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded">{priorityLabel}</span>
          )}
        </div>
      )}

      <h4 className="font-medium text-gray-800 mb-2">{brief.title}</h4>

      <div className="flex items-center text-xs text-gray-500 mb-3">
        <span className="mr-2">Due {brief.dueDate}</span>
        <span className="text-xs text-gray-400">• {selectedMonth}</span>
      </div>

      <div className="flex items-center mb-3">
        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 mr-1">
          {brief.seoStrategist.split(' ').map(name => name[0]).join('')}
        </div>
        <span className="text-xs text-gray-600">{brief.seoStrategist}</span>
      </div>

      {/* Action buttons */}
      {brief.status === 'Review Brief' && (
        <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-100">
          <button className="flex-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded hover:bg-green-200 transition-colors">
            Approve (✓)
          </button>
          <button className="flex-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded hover:bg-gray-200 transition-colors">
            Request Changes (R)
          </button>
        </div>
      )}

      {/* View Document link */}
      <div className="mt-3 text-center">
        <a
          href={brief.docLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs text-primary hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Document
        </a>
      </div>
    </div>
  );
}

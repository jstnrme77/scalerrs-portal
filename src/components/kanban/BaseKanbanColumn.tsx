'use client';

import { ReactNode } from 'react';
import { useDrop } from 'react-dnd';

interface BaseKanbanColumnProps {
  title: string;
  status: string;
  itemCount: number;
  itemType: string;
  bgColor: string;
  onStatusChange: (id: string, newStatus: string) => void;
  renderEmptyState: () => ReactNode;
  children: ReactNode;
}

/**
 * Base component for kanban columns (briefs and articles)
 * Provides common structure and behavior
 */
export default function BaseKanbanColumn({
  title,
  status,
  itemCount,
  itemType,
  bgColor,
  onStatusChange,
  renderEmptyState,
  children
}: BaseKanbanColumnProps) {
  // Set up drop zone
  const [{ isOver }, drop] = useDrop(() => ({
    accept: itemType,
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
      <div className="flex flex-col">
        <div className={`flex items-center justify-between px-3 py-2 ${bgColor} rounded-t-lg`}>
          <h3 className="text-sm font-medium">
            {title}
          </h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-white bg-opacity-60 rounded">
            {itemCount}
          </span>
        </div>
        <div className="h-px bg-gray-200 w-full mt-1"></div>
      </div>

      <div className="bg-white rounded-b-lg p-3 mt-2">
        {/* Render children (cards) */}
        {children}

        {/* Empty state */}
        {itemCount === 0 && renderEmptyState()}
      </div>
    </div>
  );
}

'use client';

import { ReactNode } from 'react';
import { useDrag } from 'react-dnd';
import { isDateOverdue } from '@/utils/date-utils';
import DocumentLink from '@/components/ui/DocumentLink';

interface BaseKanbanCardProps {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
  selectedMonth: string;
  documentLink?: string;
  documentTitle?: string;
  secondaryDocumentLink?: string;
  secondaryDocumentTitle?: string;
  itemType: string;
  hideActions?: boolean;
  onViewDocument?: (url: string, title: string) => void;
  onStatusChange?: (id: string, newStatus: string) => void;
  renderMetadata?: () => ReactNode;
  renderActions?: () => ReactNode;
  renderAdditionalContent?: () => ReactNode;
}

/**
 * Base component for kanban cards (briefs and articles)
 * Provides common structure and behavior
 */
export default function BaseKanbanCard({
  id,
  title,
  status,
  dueDate,
  selectedMonth,
  documentLink,
  documentTitle,
  secondaryDocumentLink,
  secondaryDocumentTitle,
  itemType,
  hideActions = false,
  onViewDocument,
  onStatusChange,
  renderMetadata,
  renderActions,
  renderAdditionalContent
}: BaseKanbanCardProps) {
  // Set up drag and drop
  const [{ isDragging }, drag] = useDrag(() => ({
    type: itemType,
    item: { id, status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Check if the item is overdue
  const isOverdue = isDateOverdue(dueDate);

  return (
    <div
      ref={drag as any}
      className={`p-6 border border-gray-200 rounded-xl w-full mb-3 bg-white shadow-sm ${isDragging ? 'opacity-50' : ''}`}
      style={{ cursor: 'move' }}
    >
      {/* Priority indicator */}
      {isOverdue && (
        <div className="mb-2">
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">Overdue</span>
        </div>
      )}

      {/* Title */}
      <h4 className="font-medium text-gray-800 text-base mt-2 mb-5">{title}</h4>

      {/* Divider */}
      <div className="w-full h-px bg-gray-300 mb-5"></div>

      {/* Due date and month */}
      <div className="flex items-center text-xs text-gray-500 mb-4">
        <span className="mr-1">Due {dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}</span>
        <span className="text-xs text-gray-400 mr-1">•</span>
        <span className="text-xs text-primary">{selectedMonth}</span>
      </div>

      {/* Metadata (client, writer, etc.) */}
      {renderMetadata && (
        <div className="mb-4">
          {renderMetadata()}
        </div>
      )}

      {/* Action buttons */}
      {!hideActions && renderActions && (
        <>
          <div className="w-full h-px bg-gray-300 mb-5"></div>
          <div className="flex space-x-2 mb-4">
            {renderActions()}
          </div>
        </>
      )}

      {/* Document links */}
      {(documentLink || secondaryDocumentLink) && (
        <>
          <div className="w-full h-px bg-gray-300 mb-5"></div>
          <div className="flex flex-col space-y-3 mb-4">
            {documentLink && (
              <div className="text-center">
                <DocumentLink
                  url={documentLink}
                  title={documentTitle || title}
                  onViewDocument={onViewDocument}
                />
              </div>
            )}

            {secondaryDocumentLink && (
              <div className="text-center">
                <DocumentLink
                  url={secondaryDocumentLink}
                  title={secondaryDocumentTitle || `${title} - Secondary Document`}
                  label={secondaryDocumentTitle ? undefined : "View Secondary Document"}
                  onViewDocument={onViewDocument}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Additional content */}
      {renderAdditionalContent && (
        <>
          <div className="w-full h-px bg-gray-300 mb-5"></div>
          <div className="space-y-3 mb-4">
            {renderAdditionalContent()}
          </div>
        </>
      )}
    </div>
  );
}

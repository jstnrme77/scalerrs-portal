import { useDrag } from 'react-dnd';
import { ItemTypes } from '@/constants/DragTypes';
import { Brief, BriefStatus } from '@/types';

interface BriefCardProps {
  brief: Brief;
  selectedMonth: string;
  onStatusChange?: (id: string, newStatus: BriefStatus) => void;
}

// Helper function to format date as "MMM D" (e.g., "Apr 7")
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'No date';

  try {
    // Handle ISO format (YYYY-MM-DD)
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.log('Invalid date format:', dateString);
      return dateString; // Return original if invalid
    }

    // Format as "Apr 10" (short month name and day)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original on error
  }
};

// Helper function to get display name from a field that could be string, array, or undefined
const getDisplayName = (field: string | string[] | undefined): string => {
  if (!field) return 'Unassigned';

  // If it's a string, just return it (we're handling record IDs in the airtable.ts file now)
  if (typeof field === 'string') {
    return field;
  }

  // If it's an array, return the first item
  if (Array.isArray(field) && field.length > 0) {
    return typeof field[0] === 'string' ? field[0] : 'Unassigned';
  }

  return 'Unassigned';
};

export default function BriefCard({ brief, selectedMonth, onStatusChange }: BriefCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.BRIEF_CARD,
    item: { id: brief.id, status: brief.Status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Check if the brief is overdue
  const isOverdue = brief.DueDate ? new Date(brief.DueDate) < new Date() : false;

  // Determine card color based on status to match column headers
  let cardBgColor = '';

  if (brief.Status === 'Review Brief' || brief.Status === 'Needs Review') {
    cardBgColor = 'bg-[#f9f0ff]'; // Light purple to match the header bg-[#f9f0ff]
  } else if (brief.Status === 'In Progress') {
    cardBgColor = 'bg-[#f0f4ff]'; // Light blue to match the header bg-[#f0f4ff]
  } else if (brief.Status === 'Brief Approved' || brief.Status === 'Approved') {
    cardBgColor = 'bg-[#f0fff4]'; // Light green to match the header bg-[#f0fff4]
  } else if (brief.Status === 'Needs Input') {
    cardBgColor = 'bg-[#f8f9fa]'; // Light gray to match the header bg-white
  }

  return (
    <div
      ref={drag as any}
      className={`p-5 border-b border-gray-100 w-full ${isDragging ? 'opacity-50' : ''} ${cardBgColor}`}
      style={{ cursor: 'move' }}
    >
      {/* Priority indicator */}
      {isOverdue && (
        <div className="mb-2">
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">Overdue</span>
        </div>
      )}

      <h4 className="font-medium text-gray-800 mb-2">{brief.Title}</h4>

      <div className="flex items-center text-xs text-gray-500 mb-2">
        <span className="mr-1">Due {brief.DueDate ? formatDate(brief.DueDate) : 'No date'}</span>
        <span className="text-xs text-gray-400 mr-1">•</span>
        <span className="text-xs text-primary">{selectedMonth}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-3">
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-1">Writer:</span>
          <span className="text-xs text-gray-700 truncate">{getDisplayName(brief.ContentWriter)}</span>
        </div>

        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-1">Editor:</span>
          <span className="text-xs text-gray-700 truncate">{getDisplayName(brief.ContentEditor)}</span>
        </div>

        <div className="flex items-center col-span-2">
          <span className="text-xs text-gray-500 mr-1">Client:</span>
          <span className="text-xs text-gray-700 truncate">{typeof brief.Client === 'string' ? brief.Client : 'Example Client'}</span>
        </div>
      </div>

      {/* Action buttons */}
      {(brief.Status === 'Review Brief' || brief.Status === 'Needs Review') && (
        <div className="flex space-x-2 mt-3">
          <button
            className="flex items-center justify-center px-3 py-1 bg-green-500 text-white text-xs font-medium rounded hover:bg-green-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              if (onStatusChange) {
                onStatusChange(brief.id, 'Approved');
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Approve
          </button>
          <button
            className="flex items-center justify-center px-3 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              if (onStatusChange) {
                onStatusChange(brief.id, 'Needs Input');
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Request Changes
          </button>
        </div>
      )}

      {/* View Document link */}
      {brief.DocumentLink && (
        <div className="mt-3 text-center">
          <a
            href={brief.DocumentLink}
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
      )}
    </div>
  );
}

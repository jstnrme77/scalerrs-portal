import { useDrag } from 'react-dnd';
import { ItemTypes } from '@/constants/DragTypes';
import { Brief, BriefStatus } from '@/types';
import { getClientNameSync } from '@/utils/clientUtils';
import { ensureUrlProtocol } from '@/utils/field-utils';
import { FileText } from 'lucide-react';

interface BriefCardProps {
  brief: Brief;
  selectedMonth: string;
  onStatusChange?: (id: string, newStatus: BriefStatus) => void;
  hideActions?: boolean;
  onViewDocument?: (url: string, title: string) => void;
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

// Helper function to truncate URLs in titles
const formatTitle = (title: string): string => {
  // Check if the title is a URL (specifically a Frase URL)
  if (title.startsWith('https://app.frase.io/') || title.startsWith('http://app.frase.io/')) {
    return 'Frase Document';
  }

  // Check if it's any other URL
  if (title.startsWith('https://') || title.startsWith('http://')) {
    // Extract domain name
    try {
      const url = new URL(title);
      return `Document from ${url.hostname}`;
    } catch (e) {
      // If URL parsing fails, truncate the URL
      return title.length > 40 ? title.substring(0, 37) + '...' : title;
    }
  }

  return title;
};

export default function BriefCard({ brief, selectedMonth, onStatusChange, hideActions = false, onViewDocument }: BriefCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.BRIEF_CARD,
    item: { id: brief.id, status: brief.Status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Check if the brief is overdue
  const isOverdue = brief.DueDate ? new Date(brief.DueDate) < new Date() : false;

  // No background colors for cards

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

      <h4 className="font-medium text-gray-800 text-base mt-2 mb-5">{formatTitle(brief.Title)}</h4>

      <div className="w-full h-px bg-gray-300 mb-5"></div>

      <div className="flex items-center text-xs text-gray-500 mb-4">
        <span className="mr-1">Due {brief.DueDate ? formatDate(brief.DueDate) : 'No date'}</span>
        <span className="text-xs text-gray-400 mr-1">•</span>
        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-md font-medium">{selectedMonth}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-2 mb-4">
        <div className="flex items-center col-span-2">
          <span className="text-xs text-gray-500 mr-1">SEO Strategist:</span>
          <span className="text-xs text-gray-700 truncate">{getDisplayName(brief['SEO Strategist'] || brief['SEO Assignee'])}</span>
        </div>

        <div className="flex items-center col-span-2">
          <span className="text-xs text-gray-500 mr-1">Content Writer:</span>
          <span className="text-xs text-gray-700 truncate">{getDisplayName(brief['Content Writer'] || brief.ContentWriter)}</span>
        </div>

        <div className="flex items-center col-span-2">
          <span className="text-xs text-gray-500 mr-1">Client:</span>
          <span className="text-xs text-gray-700 truncate">
            {getClientNameSync(brief['All Clients'] || brief.Client)}
          </span>
        </div>

        {brief['Target Page URL'] && (
          <div className="flex items-center col-span-2">
            <span className="text-xs text-gray-500 mr-1">Target URL:</span>
            <a
              href={ensureUrlProtocol(brief['Target Page URL'])}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary truncate hover:underline"
            >
              {brief['Target Page URL']}
            </a>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!hideActions && (
        brief.Status === 'Review Brief' ||
        brief.Status === 'Needs Review' ||
        brief.Status === 'Brief Under Internal Review'
      ) && (
        <>
          <div className="w-full h-px bg-gray-300 mb-5"></div>
          <div className="flex space-x-2 mb-4">
            <button
              className="flex items-center justify-center px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded hover:bg-green-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (onStatusChange) {
                  onStatusChange(brief.id, 'Brief Approved');
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approve
            </button>
            <button
              className="flex items-center justify-center px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (onStatusChange) {
                  onStatusChange(brief.id, 'Brief Creation Needed');
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Request Changes
            </button>
          </div>
        </>
      )}

      {/* Document links */}
      {(brief.DocumentLink || brief['FraseDocumentLink'] || brief['Content Brief Link (G Doc)'] || brief['Frase Link']) && (
        <>
          <div className="w-full h-px bg-gray-300 mb-5"></div>
          <div className="flex flex-col space-y-3 mb-4">
            {brief.DocumentLink && (
              <div className="text-center">
                {onViewDocument ? (
                  <button
                    onClick={() => {
                      if (brief.DocumentLink) {
                        onViewDocument(ensureUrlProtocol(brief.DocumentLink), formatTitle(brief.Title) || 'Brief Document');
                      }
                    }}
                    className="inline-flex items-center text-xs text-primary hover:underline"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Document
                  </button>
                ) : (
                  <a
                    href={ensureUrlProtocol(brief.DocumentLink || '')}
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
                )}
              </div>
            )}

            {brief['Content Brief Link (G Doc)'] && (
              <div className="text-center">
                <a
                  href={ensureUrlProtocol(brief['Content Brief Link (G Doc)'] || '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-primary hover:underline"
                >
                  <FileText size={14} className="mr-1" />
                  View Brief
                </a>
              </div>
            )}

            {brief['FraseDocumentLink'] && (
              <div className="text-center">
                {onViewDocument ? (
                  <button
                    onClick={() => {
                      if (brief['FraseDocumentLink']) {
                        onViewDocument(ensureUrlProtocol(brief['FraseDocumentLink']), `${formatTitle(brief.Title) || 'Brief'} - Frase Document`);
                      }
                    }}
                    className="inline-flex items-center text-xs text-primary hover:underline"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Frase Document
                  </button>
                ) : (
                  <a
                    href={ensureUrlProtocol(brief['FraseDocumentLink'] || '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-primary hover:underline"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Frase Document
                  </a>
                )}
              </div>
            )}

            {brief['Frase Link'] && (
              <div className="text-center">
                <a
                  href={ensureUrlProtocol(brief['Frase Link'] || '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-primary hover:underline"
                >
                  <FileText size={14} className="mr-1" />
                  Frase Link
                </a>
              </div>
            )}
          </div>
        </>
      )}

      {/* Target Keywords and Word Count */}
      {(brief['TargetKeywords'] || (brief['WordCountTarget'] && brief['WordCountTarget'] > 0)) && (
        <>
          <div className="w-full h-px bg-gray-300 mb-5"></div>
          <div className="space-y-3 mb-4">
            {brief['TargetKeywords'] && (
              <div>
                <div className="text-xs text-gray-500 mb-1.5">Target Keywords:</div>
                <div className="text-xs text-gray-700">{brief['TargetKeywords']}</div>
              </div>
            )}

            {brief['WordCountTarget'] && brief['WordCountTarget'] > 0 && (
              <div>
                <div className="text-xs text-gray-500">Word Count Target: <span className="text-gray-700">{brief['WordCountTarget']}</span></div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

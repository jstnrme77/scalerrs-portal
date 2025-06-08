import React from 'react';
import { useDrag } from 'react-dnd';
import { YouTube, YouTubeStatus } from '@/types';
import { getClientNameSync } from '@/utils/clientUtils';
import { ensureUrlProtocol } from '@/utils/field-utils';
import { ItemTypes } from '@/constants/DragTypes';

interface YouTubeCardProps {
  video: YouTube;
  selectedMonth: string;
  onStatusChange?: (id: string, newStatus: YouTubeStatus) => void;
  hideActions?: boolean;
  onViewDocument?: (url: string, title: string) => void;
}

// Helper function to format title if needed
const formatVideoTitle = (title: string | undefined): string => {
  if (!title) return 'Untitled Video';
  
  // Check if the title is a URL
  if (title.startsWith('https://') || title.startsWith('http://')) {
    try {
      const url = new URL(title);
      return `Video from ${url.hostname}`;
    } catch (e) {
      // If URL parsing fails, truncate the URL
      return title.length > 40 ? title.substring(0, 37) + '...' : title;
    }
  }
  
  return title;
};

export default function YouTubeCard({ video, selectedMonth, onStatusChange, hideActions = false, onViewDocument }: YouTubeCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.YOUTUBE_CARD,
    item: { id: video.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Safely render client name, handling objects properly
  const renderClientName = React.useMemo((): React.ReactNode => {
    try {
      // Handle Clients field
      const clients = video['Clients'];
      if (!clients) return 'Unassigned';
      
      // Handle string client ID
      if (typeof clients === 'string') {
        return getClientNameSync(clients);
      }
      
      // Handle array of clients
      if (Array.isArray(clients)) {
        if (clients.length === 0) return 'Unassigned';
        
        // Map each client to a string
        const clientStrings = clients.map((client: any) => {
          if (typeof client === 'string') return getClientNameSync(client);
          if (client && typeof client === 'object' && 'id' in client) {
            return getClientNameSync(client.id as string);
          }
          if (client && typeof client === 'object' && 'name' in client) {
            return client.name as string;
          }
          return 'Unknown';
        });
        
        return clientStrings.join(', ');
      }
      
      // Handle object client
      if (clients && typeof clients === 'object') {
        const clientObj = clients as Record<string, any>;
        if ('id' in clientObj) return getClientNameSync(clientObj.id as string);
        if ('name' in clientObj) return clientObj.name as string;
      }
      
      return 'Unassigned';
    } catch (error) {
      console.error('Error rendering client name:', error);
      return 'Unassigned';
    }
  }, [video['Clients']]);

  return (
    <div
      ref={drag as any}
      className={`p-6 border border-gray-200 rounded-xl w-full mb-3 bg-white shadow-sm ${isDragging ? 'opacity-50' : ''}`}
      style={{ cursor: 'move' }}
    >
      <h4 className="font-medium text-gray-800 text-base mt-2 mb-5 break-words">
        {formatVideoTitle(video['Video Title'] || video['Keyword Topic'])}
      </h4>

      <div className="w-full h-px bg-gray-300 mb-5"></div>

      <div className="flex items-center text-xs text-gray-500 mb-4">
        <span className="mr-1">Target: {video['Target Month'] || 'Not specified'}</span>
        <span className="text-xs text-gray-400 mr-1">•</span>
        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-md font-medium">{selectedMonth}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-2 mb-4">
        <div className="flex items-center col-span-2">
          <span className="text-xs text-gray-500 mr-1">Video Type:</span>
          <span className="text-xs text-gray-700 break-words">{video['Video Type'] || 'Not specified'}</span>
        </div>

        <div className="flex items-center col-span-2">
          <span className="text-xs text-gray-500 mr-1">YouTube Host:</span>
          <span className="text-xs text-gray-700 break-words">
            {typeof video['YouTube Host'] === 'string' 
              ? video['YouTube Host'] 
              : Array.isArray(video['YouTube Host']) 
                ? (video['YouTube Host'] as string[]).join(', ') 
                : 'Unassigned'}
          </span>
        </div>

        <div className="flex items-center col-span-2">
          <span className="text-xs text-gray-500 mr-1">YouTube Strategist:</span>
          <span className="text-xs text-gray-700 break-words">
            {typeof video['YouTube Strategist'] === 'string' 
              ? video['YouTube Strategist'] 
              : Array.isArray(video['YouTube Strategist']) 
                ? (video['YouTube Strategist'] as string[]).join(', ') 
                : 'Unassigned'}
          </span>
        </div>

        <div className="flex items-center col-span-2">
          <span className="text-xs text-gray-500 mr-1">Client:</span>
          <span className="text-xs text-gray-700 break-words">
            {renderClientName}
          </span>
        </div>

        {video['Competitor video URL'] && (
          <div className="flex items-center col-span-2">
            <span className="text-xs text-gray-500 mr-1">Competitor URL:</span>
            <a
              href={ensureUrlProtocol(video['Competitor video URL'])}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline break-words"
            >
              {video['Competitor video URL']}
            </a>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!hideActions && video['Script (G-Doc URL)'] && (
        <>
          <div className="w-full h-px bg-gray-300 mb-5"></div>
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => onViewDocument?.(
                ensureUrlProtocol(video['Script (G-Doc URL)']!),
                `Script: ${video['Keyword Topic'] || video['Video Title'] || 'YouTube Video'}`
              )}
              className="flex items-center justify-center px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Script
            </button>
          </div>
        </>
      )}
    </div>
  );
} 
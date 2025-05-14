import { useDrag } from 'react-dnd';
import { ItemTypes } from '@/constants/DragTypes';
import { Article, ArticleStatus } from '@/types';
import { getClientNameSync } from '@/utils/clientUtils';

interface ArticleCardProps {
  article: Article;
  selectedMonth: string;
  onStatusChange?: (id: string, newStatus: ArticleStatus) => void;
  hideActions?: boolean;
  onViewDocument?: (url: string, title: string) => void;
}

// Helper function to get month abbreviation
const getMonthAbbreviation = (month: number): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month];
};

export default function ArticleCard({ article, selectedMonth, onStatusChange, hideActions = false, onViewDocument }: ArticleCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.ARTICLE_CARD,
    item: { id: article.id, status: article.Status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Check if the article is overdue
  const dueDate = article.DueDate || article['Due Date'];
  const isOverdue = dueDate ? new Date(dueDate as string) < new Date() : false;

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

      <h4 className="font-medium text-gray-800 text-base mt-2 mb-5">{article.Title}</h4>

      <div className="w-full h-px bg-gray-300 mb-5"></div>

      <div className="flex items-center text-xs text-gray-500 mb-4">
        <span className="mr-1">Due {dueDate ?
          `${getMonthAbbreviation(new Date(dueDate as string).getMonth())} ${new Date(dueDate as string).getDate()}`
          : 'No date'}</span>
        <span className="text-xs text-gray-400 mr-1">•</span>
        <span className="text-xs text-primary">{selectedMonth}</span>
        {/* {(article.WordCount || article['Word Count']) && (
          <>
            <span className="text-xs text-gray-400 mr-1">•</span>
            <span className="text-xs text-gray-500">{article.WordCount || article['Word Count']} words</span>
          </>
        )} */}
      </div>

      <div className="flex flex-col gap-y-2 mb-4">
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-1">Writer:</span>
          <span className="text-xs text-gray-700 truncate">
            {article['Content Writer'] || article.Writer || 'Unassigned'}
          </span>
        </div>

        {(article.WordCount || article['Word Count']) && (
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-1">Word Count:</span>
            <span className="text-xs text-gray-700 truncate">
              {article.WordCount || article['Word Count']}
            </span>
          </div>
        )}

        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-1">Client:</span>
          <span className="text-xs text-gray-700 truncate">
            {getClientNameSync(article['All Clients'] || article.Client)}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      {!hideActions && article.Status === 'Review Draft' && (
        <>
          <div className="w-full h-px bg-gray-300 mb-5"></div>
          <div className="flex space-x-2 mb-4">
            <button
              className="flex items-center justify-center px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded hover:bg-green-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (onStatusChange) {
                  onStatusChange(article.id, 'Draft Approved');
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
                  onStatusChange(article.id, 'In Production');
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

      {/* View Document/Article link */}
      {(article.Status === 'Live' && (article.ArticleURL || article['Article URL'])) ||
       (article.DocumentLink || article['Document Link']) ? (
        <>
          <div className="w-full h-px bg-gray-300 mb-5"></div>
          <div className="text-center mb-4">
            {article.Status === 'Live' && (article.ArticleURL || article['Article URL']) ? (
              <a
                href={article.ArticleURL || article['Article URL']}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-primary hover:underline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Article
              </a>
            ) : (article.DocumentLink || article['Document Link']) ? (
              onViewDocument ? (
                <button
                  onClick={() => {
                    const docLink = article.DocumentLink || article['Document Link'];
                    if (docLink) {
                      onViewDocument(docLink, article.Title || 'Article Document');
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
                  href={article.DocumentLink || article['Document Link']}
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
              )
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

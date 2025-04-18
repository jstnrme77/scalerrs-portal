import { useDrag } from 'react-dnd';
import { ItemTypes } from '@/constants/DragTypes';
import { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.ARTICLE_CARD,
    item: { id: article.id, status: article.status },
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
      <h4 className="font-medium text-text-light dark:text-text-dark mb-2">{article.title}</h4>
      <div className="flex items-center text-xs text-mediumGray dark:text-gray-300 mb-2">
        <span className="mr-2">{article.status === 'Live' ? 'Sent' : 'Due'} {article.dueDate}</span>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs bg-[#e9ecef] dark:bg-darkGray px-2 py-1 rounded text-mediumGray dark:text-gray-300">{article.wordCount} words</span>
        {article.status === 'Live' && article.articleUrl ? (
          <a
            href={article.articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            View Article
          </a>
        ) : (
          <a
            href={article.docLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            View Doc
          </a>
        )}
      </div>
      <div className="flex items-center mt-3 pt-3 border-t border-lightGray dark:border-container">
        <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs text-white">
          {article.writer.split(' ').map(name => name[0]).join('')}
        </div>
        <span className="text-xs ml-2">{article.writer}</span>
      </div>
    </div>
  );
}

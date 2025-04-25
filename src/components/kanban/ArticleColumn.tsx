import { useDrop } from 'react-dnd';
import { ItemTypes } from '@/constants/DragTypes';
import ArticleCard from './ArticleCard';
import { Article, ArticleStatus } from '@/types';

interface ArticleColumnProps {
  title: string;
  status: ArticleStatus;
  articles: Article[];
  bgColor: string;
  selectedMonth?: string;
  onStatusChange: (id: string, newStatus: ArticleStatus) => void;
}

export default function ArticleColumn({
  title,
  status,
  articles,
  bgColor,
  selectedMonth,
  onStatusChange
}: ArticleColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.ARTICLE_CARD,
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
      <div className={`flex items-center justify-between px-3 py-2 ${bgColor} rounded-lg`}>
        <h3 className="text-sm font-medium">
          {title}
        </h3>
        <span className="px-2 py-0.5 text-xs font-medium bg-white bg-opacity-60 rounded">
          {articles.length}
        </span>
      </div>

      <div className="bg-white rounded-b-lg p-0 mt-3 space-y-1">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            selectedMonth={selectedMonth || ''}
            onStatusChange={onStatusChange}
          />
        ))}

        {articles.length === 0 && (
          <div className="p-4 text-center">
            {status === 'Draft Approved' ? (
              <p className="text-sm text-gray-500">No items currently need draft approved</p>
            ) : status === 'To Be Published' ? (
              <p className="text-sm text-gray-500">No items currently need to be published</p>
            ) : (
              <p className="text-sm text-gray-500">No items currently need {status.toLowerCase()}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useDrop } from 'react-dnd';
import { ItemTypes } from '@/constants/DragTypes';
import ArticleCard from './ArticleCard';
import { Article, ArticleStatus } from '@/types';

interface ArticleColumnProps {
  title: string;
  status: ArticleStatus;
  articles: Article[];
  bgColor: string;
  onStatusChange: (id: number, newStatus: ArticleStatus) => void;
}

export default function ArticleColumn({
  title,
  status,
  articles,
  bgColor,
  onStatusChange
}: ArticleColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.ARTICLE_CARD,
    drop: (item: { id: number }) => {
      onStatusChange(item.id, status);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop as any}
      className={`${bgColor} p-4 rounded-lg shadow-sm border border-lightGray ${isOver ? 'ring-2 ring-primary' : ''}`}
    >
      <h3 className="text-md font-medium text-dark mb-4 flex items-center">
        {title}
        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-white rounded-full text-mediumGray">
          {articles.length}
        </span>
      </h3>

      <div className="space-y-3">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
          />
        ))}

        {articles.length === 0 && (
          <div className="bg-white p-4 rounded-lg border border-dashed border-lightGray text-center">
            <p className="text-sm text-mediumGray">No articles</p>
          </div>
        )}
      </div>
    </div>
  );
}

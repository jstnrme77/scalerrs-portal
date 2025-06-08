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
  hideActions?: boolean;
  onViewDocument?: (url: string, title: string) => void;
}

export default function ArticleColumn({
  title,
  status,
  articles,
  bgColor,
  selectedMonth,
  onStatusChange,
  hideActions = false,
  onViewDocument
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

  // Define background colors for different statuses
  const getStatusColor = () => {
    switch (status) {
      // Early stages
      case 'Awaiting Writer Assignment':
        return 'bg-yellow-50 border-yellow-200';
      case 'Writing In Progress':
      case 'In Production': // Legacy support
        return 'bg-yellow-50 border-yellow-200';

      // Review stages
      case 'Under Client Review':
        return 'bg-orange-50 border-orange-200';
      case 'Under Editor Review':
      case 'Review Draft': // Legacy support
        return 'bg-orange-50 border-orange-200';
      case 'Writer Revision Needed':
        return 'bg-red-50 border-red-200';

      // Approval stages
      case 'Content Approved':
      case 'Draft Approved': // Legacy support
        return 'bg-indigo-50 border-indigo-200';

      // Asset stages
      case 'Visual Assets Needed':
        return 'bg-pink-50 border-pink-200';
      case 'Visual Assets Complete':
        return 'bg-pink-100 border-pink-300';

      // Publication stages
      case 'Ready for CMS Upload':
        return 'bg-purple-50 border-purple-200';
      case 'Internal Linking Needed':
        return 'bg-purple-50 border-purple-200';
      case 'Ready for Publication':
      case 'To Be Published': // Legacy support
        return 'bg-purple-100 border-purple-300';

      // Completion stages
      case 'Published':
      case 'Live': // Legacy support
        return 'bg-green-50 border-green-200';
      case 'Reverse Internal Linking Needed':
        return 'bg-green-50 border-green-200';
      case 'Complete':
      case 'Content Published':
        return 'bg-green-100 border-green-300';

      // Special statuses
      case 'Cancelled':
        return 'bg-gray-50 border-gray-200';
      case 'On Hold':
        return 'bg-blue-50 border-blue-200';

      default:
        return 'bg-white border-gray-200';
    }
  };

  const statusColor = getStatusColor();

  // Define header background colors for different statuses
  const getHeaderBgColor = () => {
    switch (status) {
      // Early stages
      case 'Awaiting Writer Assignment':
        return 'bg-yellow-100';
      case 'Writing In Progress':
      case 'In Production': // Legacy support
        return 'bg-yellow-100';

      // Review stages
      case 'Under Client Review':
        return 'bg-orange-100';
      case 'Under Editor Review':
      case 'Review Draft': // Legacy support
        return 'bg-orange-100';
      case 'Writer Revision Needed':
        return 'bg-red-100';

      // Approval stages
      case 'Content Approved':
      case 'Draft Approved': // Legacy support
        return 'bg-indigo-100';

      // Asset stages
      case 'Visual Assets Needed':
        return 'bg-pink-100';
      case 'Visual Assets Complete':
        return 'bg-pink-200';

      // Publication stages
      case 'Ready for CMS Upload':
        return 'bg-purple-100';
      case 'Internal Linking Needed':
        return 'bg-purple-100';
      case 'Ready for Publication':
      case 'To Be Published': // Legacy support
        return 'bg-purple-200';

      // Completion stages
      case 'Published':
      case 'Live': // Legacy support
        return 'bg-green-100';
      case 'Reverse Internal Linking Needed':
        return 'bg-green-100';
      case 'Complete':
      case 'Content Published':
        return 'bg-green-200';

      // Special statuses
      case 'Cancelled':
        return 'bg-gray-100';
      case 'On Hold':
        return 'bg-blue-100';

      default:
        return 'bg-gray-100';
    }
  };

  const headerBgColor = getHeaderBgColor();

  return (
    <div
      ref={drop as any}
      className={`w-[500px] rounded-lg ${isOver ? 'ring-2 ring-primary' : ''} border ${statusColor}`}
    >
      <div className="flex flex-col">
        <div className={`${headerBgColor} rounded-t-lg kanban-column-header`}>
          <h3 className="truncate">
            {title}
          </h3>
          <span className="count-badge">
            {articles.length}
          </span>
        </div>
      </div>

      <div className={`${statusColor} rounded-b-lg p-3`}>
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            selectedMonth={selectedMonth || ''}
            onStatusChange={onStatusChange}
            hideActions={hideActions}
            onViewDocument={onViewDocument}
          />
        ))}

        {articles.length === 0 && (
          <div className="p-4 text-center">
            {status === 'Content Approved' || status === 'Draft Approved' ? (
              <p className="text-sm text-gray-500">No items currently need content approval</p>
            ) : status === 'Ready for Publication' || status === 'To Be Published' ? (
              <p className="text-sm text-gray-500">No items currently need to be published</p>
            ) : status === 'Awaiting Writer Assignment' ? (
              <p className="text-sm text-gray-500">No items currently need writer assignment</p>
            ) : status === 'Writing In Progress' || status === 'In Production' ? (
              <p className="text-sm text-gray-500">No items currently in writing progress</p>
            ) : status === 'Under Client Review' ? (
              <p className="text-sm text-gray-500">No items currently under client review</p>
            ) : status === 'Under Editor Review' || status === 'Review Draft' ? (
              <p className="text-sm text-gray-500">No items currently under editor review</p>
            ) : status === 'Writer Revision Needed' ? (
              <p className="text-sm text-gray-500">No items currently need writer revision</p>
            ) : status === 'Visual Assets Needed' ? (
              <p className="text-sm text-gray-500">No items currently need visual assets</p>
            ) : status === 'Visual Assets Complete' ? (
              <p className="text-sm text-gray-500">No items with completed visual assets</p>
            ) : status === 'Ready for CMS Upload' ? (
              <p className="text-sm text-gray-500">No items currently ready for CMS upload</p>
            ) : status === 'Internal Linking Needed' ? (
              <p className="text-sm text-gray-500">No items currently need internal linking</p>
            ) : status === 'Published' || status === 'Live' ? (
              <p className="text-sm text-gray-500">No items currently published</p>
            ) : status === 'Reverse Internal Linking Needed' ? (
              <p className="text-sm text-gray-500">No items currently need reverse internal linking</p>
            ) : status === 'Complete' ? (
              <p className="text-sm text-gray-500">No items currently complete</p>
            ) : status === 'Cancelled' ? (
              <p className="text-sm text-gray-500">No items currently cancelled</p>
            ) : status === 'On Hold' ? (
              <p className="text-sm text-gray-500">No items currently on hold</p>
            ) : status === 'Content Published' ? (
              <p className="text-sm text-gray-500">No items with content published</p>
            ) : (
              <p className="text-sm text-gray-500">No items in {status.toLowerCase()} status</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

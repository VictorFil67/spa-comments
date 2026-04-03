import type { Comment, SortBy, SortOrder } from '../../types';
import { CommentItem } from './CommentItem';
import './CommentTree.css';

interface Props {
  comments: Comment[];
  sortBy: SortBy;
  order: SortOrder;
  page: number;
  totalPages: number;
  onSortChange: (sortBy: SortBy, order: SortOrder) => void;
  onPageChange: (page: number) => void;
  onReply: (parentId: number) => void;
  onImageClick: (src: string, alt: string) => void;
}

export function CommentTree({
  comments,
  sortBy,
  order,
  page,
  totalPages,
  onSortChange,
  onPageChange,
  onReply,
  onImageClick,
}: Props) {
  const handleSort = (field: SortBy) => {
    if (sortBy === field) {
      onSortChange(field, order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      onSortChange(field, 'DESC');
    }
  };

  const sortIndicator = (field: SortBy) => {
    if (sortBy !== field) return '';
    return order === 'ASC' ? ' ▲' : ' ▼';
  };

  return (
    <div className="comment-tree">
      <div className="sort-controls">
        <span>Sort by:</span>
        <button
          className={sortBy === 'username' ? 'active' : ''}
          onClick={() => handleSort('username')}
        >
          User Name{sortIndicator('username')}
        </button>
        <button
          className={sortBy === 'email' ? 'active' : ''}
          onClick={() => handleSort('email')}
        >
          E-mail{sortIndicator('email')}
        </button>
        <button
          className={sortBy === 'createdAt' ? 'active' : ''}
          onClick={() => handleSort('createdAt')}
        >
          Date{sortIndicator('createdAt')}
        </button>
      </div>

      <div className="comments-list">
        {comments.length === 0 && (
          <p className="no-comments">No comments yet. Be the first!</p>
        )}
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={onReply}
            onImageClick={onImageClick}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            ← Prev
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

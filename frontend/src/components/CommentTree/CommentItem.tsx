import { useState } from 'react';
import type { Comment } from '../../types';
import { getFileUrl } from '../../api/client';
import './CommentTree.css';

interface Props {
  comment: Comment;
  onReply: (parentId: number) => void;
  onImageClick: (src: string, alt: string) => void;
}

export function CommentItem({ comment, onReply, onImageClick }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, attachment } = comment;

  return (
    <div className="comment-item">
      <div className="comment-header">
        <span className="comment-username">{user.username}</span>
        <span className="comment-email">{user.email}</span>
        {user.homePage && (
          <a
            href={user.homePage}
            target="_blank"
            rel="noopener noreferrer"
            className="comment-homepage"
          >
            {user.homePage}
          </a>
        )}
        <span className="comment-date">
          {new Date(comment.createdAt).toLocaleString()}
        </span>
      </div>

      <div
        className="comment-text"
        dangerouslySetInnerHTML={{ __html: comment.text }}
      />

      {attachment && attachment.type === 'image' && (
        <div className="comment-attachment">
          <img
            src={getFileUrl(attachment.filePath)}
            alt={attachment.originalName}
            className="comment-image"
            onClick={() =>
              onImageClick(
                getFileUrl(attachment.filePath),
                attachment.originalName,
              )
            }
          />
        </div>
      )}

      {attachment && attachment.type === 'text' && (
        <div className="comment-attachment">
          <a
            href={getFileUrl(attachment.filePath)}
            target="_blank"
            rel="noopener noreferrer"
            className="comment-file-link"
          >
            {attachment.originalName}
          </a>
        </div>
      )}

      <div className="comment-actions">
        <button
          className="btn-reply"
          onClick={() => onReply(comment.id)}
        >
          Reply
        </button>
      </div>

      {comment.children && comment.children.length > 0 && (
        <>
          <button
            className="btn-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed
              ? `Show replies (${comment.children.length})`
              : 'Hide replies'}
          </button>
          {!collapsed && (
            <div className="comment-children">
              {comment.children.map((child) => (
                <CommentItem
                  key={child.id}
                  comment={child}
                  onReply={onReply}
                  onImageClick={onImageClick}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

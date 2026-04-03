import { useState, useEffect, useCallback } from 'react';
import { fetchComments } from './api/client';
import { CommentTree } from './components/CommentTree';
import { CommentForm } from './components/CommentForm';
import { Lightbox } from './components/Lightbox';
import { useSocket } from './hooks/useSocket';
import type { Comment, SortBy, SortOrder } from './types';
import './App.css';

function App() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [order, setOrder] = useState<SortOrder>('DESC');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(
    null,
  );

  const loadComments = useCallback(async () => {
    try {
      const res = await fetchComments(page, sortBy, order);
      setComments(res.data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  }, [page, sortBy, order]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleNewComment = useCallback(() => {
    loadComments();
  }, [loadComments]);

  useSocket(handleNewComment);

  const handleSortChange = (newSortBy: SortBy, newOrder: SortOrder) => {
    setSortBy(newSortBy);
    setOrder(newOrder);
    setPage(1);
  };

  const handleReply = (parentId: number) => {
    setReplyTo(parentId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCommentSuccess = () => {
    setReplyTo(null);
    loadComments();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Comments</h1>
      </header>

      <main className="app-main">
        <CommentForm
          parentId={replyTo}
          onSuccess={handleCommentSuccess}
          onCancel={replyTo ? () => setReplyTo(null) : undefined}
        />

        <CommentTree
          comments={comments}
          sortBy={sortBy}
          order={order}
          page={page}
          totalPages={totalPages}
          onSortChange={handleSortChange}
          onPageChange={setPage}
          onReply={handleReply}
          onImageClick={(src, alt) => setLightbox({ src, alt })}
        />
      </main>

      {lightbox && (
        <Lightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

export default App;

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Post } from '@/lib/types';
import { useSwipe } from '@/hooks/useSwipe';

interface BlogsPageProps {
  posts: Post[];
}

export default function BlogsPage({ posts }: BlogsPageProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const postsPerPage = 6;
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const currentPosts = posts.slice(
    currentPage * postsPerPage,
    (currentPage + 1) * postsPerPage
  );

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (currentPage < totalPages - 1) {
        setCurrentPage(currentPage + 1);
      }
    },
    onSwipeRight: () => {
      if (currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    },
    threshold: 100,
  });

  return (
    <div
      ref={containerRef}
      onTouchStart={swipeHandlers.onTouchStart}
      onTouchMove={swipeHandlers.onTouchMove}
      onTouchEnd={swipeHandlers.onTouchEnd}
    >
      <h2 className="text-4xl font-bold mb-8">Все блоги</h2>
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="BookOpen" size={64} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-xl text-muted-foreground">Пока нет блогов</p>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
            <div className="aspect-video overflow-hidden bg-gradient-to-br from-primary to-secondary">
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="FileText" size={48} className="text-white opacity-50" />
              </div>
            </div>
            <CardContent className="p-6">
              <h4 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h4>
              <p className="text-muted-foreground text-sm line-clamp-3">
                {post.excerpt || post.content}
              </p>
            </CardContent>
          </Card>
          ))}
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="ChevronLeft" size={24} />
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentPage
                      ? 'bg-primary w-8'
                      : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="ChevronRight" size={24} />
            </button>
          </div>
        )}
        </>
      )}
    </div>
  );
}
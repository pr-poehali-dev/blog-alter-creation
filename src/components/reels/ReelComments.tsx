import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { User, ReelComment } from '@/lib/types';

interface ReelCommentsProps {
  reelId: number;
  onClose: () => void;
  user: User | null;
}

export default function ReelComments({ reelId, onClose, user }: ReelCommentsProps) {
  const [comments, setComments] = useState<ReelComment[]>([
    {
      id: 1,
      reel_id: reelId,
      user_id: 1,
      comment: 'Крутое видео! 🔥',
      created_at: new Date().toISOString(),
      username: 'user1',
      avatar_url: '',
    },
    {
      id: 2,
      reel_id: reelId,
      user_id: 2,
      comment: 'Супер контент, жду еще! ❤️',
      created_at: new Date().toISOString(),
      username: 'user2',
      avatar_url: '',
    },
  ]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const comment: ReelComment = {
      id: Date.now(),
      reel_id: reelId,
      user_id: user.id,
      comment: newComment,
      created_at: new Date().toISOString(),
      username: user.username,
      avatar_url: user.avatar_url,
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:max-w-md md:rounded-t-3xl rounded-t-3xl h-[70vh] md:h-auto md:max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Комментарии</h3>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Пока нет комментариев</p>
              <p className="text-sm">Будьте первым!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {comment.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{comment.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-sm">{comment.comment}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Icon name="Heart" size={14} />
                </Button>
              </div>
            ))
          )}
        </div>

        {user && (
          <form onSubmit={handleAddComment} className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="text-xs">{user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Добавить комментарий..."
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!newComment.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Icon name="Send" size={16} />
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

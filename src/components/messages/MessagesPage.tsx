import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { User } from '@/lib/types';
import ChatDialog from './ChatDialog';

interface Chat {
  id: number;
  other_user_id: number;
  username: string;
  avatar_url: string | null;
  content: string;
  created_at: string;
  unread_count: number;
}

interface MessagesPageProps {
  user: User | null;
  onUnreadCountChange?: (count: number) => void;
}

export default function MessagesPage({ user, onUnreadCountChange }: MessagesPageProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatUserId, setSelectedChatUserId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  const fetchChats = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(
        `https://functions.poehali.dev/73b67c32-f278-4cd4-8c63-4e2534d8f137?messages=true&user_id=${user.id}`
      );
      const data = await response.json();
      setChats(data);
      
      const unreadTotal = data.reduce((sum: number, chat: Chat) => sum + chat.unread_count, 0);
      if (onUnreadCountChange) {
        onUnreadCountChange(unreadTotal);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatClose = () => {
    setSelectedChatUserId(null);
    fetchChats();
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <Icon name="MessageCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Сообщения</h2>
          <p className="text-muted-foreground">
            Войдите, чтобы просматривать и отправлять сообщения
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-48 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Icon name="MessageCircle" size={32} className="text-primary" />
          <h2 className="text-3xl font-bold">Сообщения</h2>
        </div>

        {chats.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Inbox" size={64} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              У вас пока нет сообщений
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <button
                key={chat.other_user_id}
                onClick={() => setSelectedChatUserId(chat.other_user_id)}
                className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors text-left"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={chat.avatar_url || undefined} />
                  <AvatarFallback>{chat.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{chat.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(chat.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.content}
                  </p>
                </div>
                {chat.unread_count > 0 && (
                  <Badge variant="default" className="ml-2">
                    {chat.unread_count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </Card>

      {selectedChatUserId && (
        <ChatDialog
          currentUserId={user.id}
          otherUserId={selectedChatUserId}
          onClose={handleChatClose}
        />
      )}
    </div>
  );
}
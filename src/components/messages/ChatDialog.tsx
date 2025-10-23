import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  story_id: number | null;
  created_at: string;
  sender_username?: string;
  sender_avatar?: string | null;
}

interface ChatDialogProps {
  currentUserId: number;
  otherUserId: number;
  onClose: () => void;
  initialMessage?: string;
  storyId?: number;
}

export default function ChatDialog({ 
  currentUserId, 
  otherUserId, 
  onClose,
  initialMessage = '',
  storyId
}: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState(initialMessage);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [currentUserId, otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/73b67c32-f278-4cd4-8c63-4e2534d8f137?messages=true&user_id=${currentUserId}&chat_with=${otherUserId}`
      );
      const data = await response.json();
      setMessages(data);
      
      if (data.length > 0) {
        const otherUserData = data[0].sender_id === currentUserId 
          ? { username: data[0].receiver_username, avatar_url: data[0].receiver_avatar }
          : { username: data[0].sender_username, avatar_url: data[0].sender_avatar };
        setOtherUser(otherUserData);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch('https://functions.poehali.dev/73b67c32-f278-4cd4-8c63-4e2534d8f137', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          sender_id: currentUserId,
          receiver_id: otherUserId,
          content: newMessage,
          story_id: storyId || null
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      } else {
        alert('Ошибка отправки сообщения');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Ошибка соединения');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            {otherUser && (
              <>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={otherUser.avatar_url || undefined} />
                  <AvatarFallback>{otherUser.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>{otherUser.username}</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Icon name="MessageCircle" size={48} className="text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Начните беседу</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <span className="text-xs opacity-75 mt-1 block">
                      {new Date(message.created_at).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="px-6 py-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Напишите сообщение..."
              disabled={sending}
            />
            <Button type="submit" disabled={!newMessage.trim() || sending}>
              {sending ? (
                <Icon name="Loader2" size={20} className="animate-spin" />
              ) : (
                <Icon name="Send" size={20} />
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

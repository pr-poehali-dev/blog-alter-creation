import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

interface Story {
  id: number;
  user_id: number;
  username: string;
  full_name: string;
  avatar_url: string | null;
  image_url: string;
  story_count: number;
  view_count: number;
  created_at: string;
}

interface StoriesBarProps {
  currentUserId: number | null;
  onStoryClick: (userId: number, stories: Story[]) => void;
  onCreateStory: () => void;
}

export default function StoriesBar({ currentUserId, onStoryClick, onCreateStory }: StoriesBarProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/73b67c32-f278-4cd4-8c63-4e2534d8f137?stories=true');
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full overflow-hidden border-b bg-background">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
                <div className="w-12 h-3 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden border-b bg-background sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {currentUserId && (
            <button
              onClick={onCreateStory}
              className="flex flex-col items-center gap-1 flex-shrink-0 group"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center">
                    <Icon name="Plus" size={24} className="text-primary" />
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium max-w-[64px] truncate">Добавить</span>
            </button>
          )}
          
          {stories.map((story) => (
            <button
              key={`story-${story.user_id}`}
              onClick={() => onStoryClick(story.user_id, stories)}
              className="flex flex-col items-center gap-1 flex-shrink-0 group"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary via-pink-500 to-secondary p-[2px]">
                  <div className="w-full h-full rounded-full bg-background p-[2px]">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={story.avatar_url || undefined} />
                      <AvatarFallback>{story.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                {story.story_count > 1 && (
                  <div className="absolute bottom-0 right-0 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-background">
                    {story.story_count}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium max-w-[64px] truncate">
                {story.username}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
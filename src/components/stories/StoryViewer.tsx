import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

interface Story {
  id: number;
  user_id: number;
  username: string;
  full_name: string;
  avatar_url: string | null;
  image_url: string;
  created_at: string;
  views?: any[];
}

interface StoryViewerProps {
  userId: number;
  currentUserId: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

interface Viewer {
  viewer_id: number;
  viewed_at: string;
}

export default function StoryViewer({ userId, currentUserId, onClose, onNext, onPrev }: StoryViewerProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showViewers, setShowViewers] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const STORY_DURATION = 5000;

  useEffect(() => {
    fetchUserStories();
  }, [userId]);

  useEffect(() => {
    if (stories.length > 0 && !isPaused) {
      startProgress();
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [currentIndex, isPaused, stories.length]);

  useEffect(() => {
    if (stories.length > 0 && currentUserId && stories[currentIndex]) {
      markAsViewed(stories[currentIndex].id);
    }
  }, [currentIndex, stories]);

  const fetchUserStories = async () => {
    try {
      const response = await fetch(`https://functions.poehali.dev/73b67c32-f278-4cd4-8c63-4e2534d8f137?stories=true&user_id=${userId}`);
      const data = await response.json();
      setStories(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user stories:', error);
      setLoading(false);
    }
  };

  const markAsViewed = async (storyId: number) => {
    if (!currentUserId) return;
    try {
      await fetch('https://functions.poehali.dev/73b67c32-f278-4cd4-8c63-4e2534d8f137', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'view_story',
          story_id: storyId,
          viewer_id: currentUserId
        })
      });
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };

  const startProgress = () => {
    setProgress(0);
    if (progressInterval.current) clearInterval(progressInterval.current);
    
    const increment = 100 / (STORY_DURATION / 50);
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, 50);
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onNext();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      onPrev();
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const halfWidth = rect.width / 2;

    if (clickX < halfWidth) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  if (loading || stories.length === 0) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white">Загрузка...</div>
      </div>
    );
  }

  const currentStory = stories[currentIndex];

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="flex gap-1 mb-4">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-white">
              <AvatarImage src={currentStory.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-white">
                {currentStory.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-white">
              <div className="font-semibold text-sm">{currentStory.username}</div>
              <div className="text-xs opacity-75">
                {new Date(currentStory.created_at).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userId === currentUserId && currentStory.views && currentStory.views.length > 0 && (
              <button
                onClick={() => setShowViewers(true)}
                className="text-white hover:opacity-75 transition-opacity flex items-center gap-1"
              >
                <Icon name="Eye" size={20} />
                <span className="text-sm">{currentStory.views.length}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white hover:opacity-75 transition-opacity"
            >
              <Icon name="X" size={24} />
            </button>
          </div>
        </div>
      </div>

      <div
        className="relative w-full h-full max-w-lg cursor-pointer select-none"
        onClick={handleClick}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <img
          src={currentStory.image_url}
          alt="Story"
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>

      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:opacity-75 transition-opacity md:block hidden"
      >
        <Icon name="ChevronLeft" size={48} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:opacity-75 transition-opacity md:block hidden"
      >
        <Icon name="ChevronRight" size={48} />
      </button>

      {showViewers && userId === currentUserId && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm max-h-[50vh] overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">
                Просмотры ({currentStory.views?.length || 0})
              </h3>
              <button
                onClick={() => setShowViewers(false)}
                className="text-white hover:opacity-75"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {currentStory.views?.map((view: any) => (
                <div key={view.viewer_id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20" />
                  <div className="text-white">
                    <div className="text-sm font-medium">Пользователь #{view.viewer_id}</div>
                    <div className="text-xs opacity-75">
                      {new Date(view.viewed_at).toLocaleString('ru-RU')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { User, Reel } from '@/lib/types';
import CreateReelDialog from './CreateReelDialog';
import ReelComments from './ReelComments';
import { useSwipe } from '@/hooks/useSwipe';

interface ReelsPageProps {
  user: User | null;
}

export default function ReelsPage({ user }: ReelsPageProps) {
  const [reels, setReels] = useState<Reel[]>([
    {
      id: 1,
      user_id: 1,
      video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      caption: 'Первое видео 🎬',
      music_title: 'Summer Vibes',
      music_artist: 'DJ Cool',
      likes_count: 234,
      comments_count: 45,
      views: 1203,
      created_at: new Date().toISOString(),
      username: 'user1',
      full_name: 'Пользователь 1',
      avatar_url: '',
      is_liked: false,
      is_saved: false,
    },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play();
            setIsPlaying(true);
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [reels]);

  const scrollToReel = (index: number) => {
    if (index >= 0 && index < reels.length) {
      setCurrentIndex(index);
      containerRef.current?.children[index].scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = (e: React.WheelEvent) => {
    if (e.deltaY > 0 && currentIndex < reels.length - 1) {
      scrollToReel(currentIndex + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      scrollToReel(currentIndex - 1);
    }
  };

  const swipeHandlers = useSwipe({
    onSwipeUp: () => scrollToReel(currentIndex + 1),
    onSwipeDown: () => scrollToReel(currentIndex - 1),
    threshold: 50,
  });

  const handleLike = (reelId: number) => {
    setReels(
      reels.map((reel) =>
        reel.id === reelId
          ? {
              ...reel,
              is_liked: !reel.is_liked,
              likes_count: reel.is_liked ? reel.likes_count - 1 : reel.likes_count + 1,
            }
          : reel
      )
    );
  };

  const handleSave = (reelId: number) => {
    setReels(
      reels.map((reel) => (reel.id === reelId ? { ...reel, is_saved: !reel.is_saved } : reel))
    );
  };

  const handleShare = (reel: Reel) => {
    if (navigator.share) {
      navigator.share({
        title: reel.caption,
        text: `Смотри это видео: ${reel.caption}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована!');
    }
  };

  const togglePlayPause = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleCreateReel = (newReel: Omit<Reel, 'id' | 'created_at' | 'likes_count' | 'comments_count' | 'views'>) => {
    const reel: Reel = {
      ...newReel,
      id: Date.now(),
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      views: 0,
      is_liked: false,
      is_saved: false,
    };
    setReels([reel, ...reels]);
    setShowCreateDialog(false);
  };

  return (
    <div className="h-screen bg-black overflow-hidden relative">
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onWheel={handleScroll}
        onTouchStart={swipeHandlers.onTouchStart}
        onTouchMove={swipeHandlers.onTouchMove}
        onTouchEnd={swipeHandlers.onTouchEnd}
      >
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className="h-screen w-full snap-start relative flex items-center justify-center"
          >
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              src={reel.video_url}
              className="h-full w-auto max-w-[56.25vh] object-cover"
              loop
              playsInline
              onClick={() => togglePlayPause(index)}
            />

            {!isPlaying && index === currentIndex && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center">
                  <Icon name="Play" size={40} className="text-white ml-2" />
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Icon name="Video" size={24} className="text-white" />
                <span className="text-white font-bold text-lg">Reels</span>
              </div>
              <Icon name="Camera" size={24} className="text-white cursor-pointer" onClick={() => user && setShowCreateDialog(true)} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <div className="max-w-[56.25vh] mx-auto">
                <div className="flex items-end justify-between">
                  <div className="flex-1 space-y-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-white">
                        <AvatarImage src={reel.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          {reel.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white font-semibold">{reel.username}</span>
                      <Button size="sm" variant="secondary" className="h-7 px-3 text-xs">
                        Подписаться
                      </Button>
                    </div>

                    <p className="text-white text-sm leading-relaxed">{reel.caption}</p>

                    {reel.music_title && (
                      <div className="flex items-center gap-2 text-white">
                        <Icon name="Music" size={14} />
                        <span className="text-xs">
                          {reel.music_title} • {reel.music_artist}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-6 ml-4">
                    <button
                      onClick={() => handleLike(reel.id)}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          reel.is_liked ? 'bg-red-500 scale-110' : 'bg-white/20 backdrop-blur-sm'
                        }`}
                      >
                        <Icon
                          name="Heart"
                          size={24}
                          className={reel.is_liked ? 'text-white fill-white' : 'text-white'}
                        />
                      </div>
                      <span className="text-white text-xs font-semibold">{reel.likes_count}</span>
                    </button>

                    <button
                      onClick={() => setShowComments(!showComments)}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Icon name="MessageCircle" size={24} className="text-white" />
                      </div>
                      <span className="text-white text-xs font-semibold">{reel.comments_count}</span>
                    </button>

                    <button onClick={() => handleShare(reel)} className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Icon name="Share2" size={24} className="text-white" />
                      </div>
                    </button>

                    <button
                      onClick={() => handleSave(reel.id)}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Icon
                          name="Bookmark"
                          size={24}
                          className={reel.is_saved ? 'text-white fill-white' : 'text-white'}
                        />
                      </div>
                    </button>

                    <button className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Icon name="MoreVertical" size={24} className="text-white" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showComments && (
        <ReelComments
          reelId={reels[currentIndex].id}
          onClose={() => setShowComments(false)}
          user={user}
        />
      )}

      {user && (
        <CreateReelDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          user={user}
          onCreateReel={handleCreateReel}
        />
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
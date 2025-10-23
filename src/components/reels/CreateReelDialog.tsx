import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { User, Reel } from '@/lib/types';

interface CreateReelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onCreateReel: (reel: Omit<Reel, 'id' | 'created_at' | 'likes_count' | 'comments_count' | 'views'>) => void;
}

export default function CreateReelDialog({ open, onOpenChange, user, onCreateReel }: CreateReelDialogProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [musicTitle, setMusicTitle] = useState('');
  const [musicArtist, setMusicArtist] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl || !caption) return;

    onCreateReel({
      user_id: user.id,
      video_url: videoUrl,
      caption,
      music_title: musicTitle || undefined,
      music_artist: musicArtist || undefined,
      username: user.username,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
    });

    setVideoUrl('');
    setCaption('');
    setMusicTitle('');
    setMusicArtist('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Video" size={24} />
            Создать Reels
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Видео</label>
            {!videoUrl ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    {isUploading ? 'Загрузка...' : 'Нажмите для загрузки видео'}
                  </p>
                  <p className="text-xs text-muted-foreground">MP4, MOV до 100MB</p>
                </label>
              </div>
            ) : (
              <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden max-h-80">
                <video src={videoUrl} className="w-full h-full object-cover" controls />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => setVideoUrl('')}
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Описание</label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Напишите описание к видео..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Музыка (опционально)</label>
            <div className="flex gap-2">
              <Input
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
                placeholder="Название трека"
              />
              <Input
                value={musicArtist}
                onChange={(e) => setMusicArtist(e.target.value)}
                placeholder="Исполнитель"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
              disabled={!videoUrl || !caption}
            >
              <Icon name="Send" size={16} className="mr-2" />
              Опубликовать
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

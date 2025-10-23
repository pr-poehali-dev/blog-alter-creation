import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { User } from '@/lib/types';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: string;
}

interface MusicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export default function MusicDialog({ open, onOpenChange, user }: MusicDialogProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddTrack = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTrack: Track = {
      id: Date.now().toString(),
      title: formData.get('title') as string,
      artist: formData.get('artist') as string,
      url: formData.get('url') as string,
      duration: '3:45',
    };
    setTracks([...tracks, newTrack]);
    setShowAddForm(false);
    e.currentTarget.reset();
  };

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handleDeleteTrack = (trackId: string) => {
    setTracks(tracks.filter(t => t.id !== trackId));
    if (currentTrack?.id === trackId) {
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Music" size={20} />
            Моя музыка
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {currentTrack && (
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Icon name="Music2" size={24} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{currentTrack.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  <Icon name={isPlaying ? 'Pause' : 'Play'} size={20} />
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="font-medium">Мои треки ({tracks.length})</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить
            </Button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddTrack} className="bg-muted p-4 rounded-lg space-y-3">
              <Input name="title" placeholder="Название трека" required />
              <Input name="artist" placeholder="Исполнитель" required />
              <Input name="url" type="url" placeholder="Ссылка на трек (mp3, ogg)" required />
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="flex-1">
                  <Icon name="Check" size={16} className="mr-2" />
                  Сохранить
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Отмена
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {tracks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="Music" size={48} className="mx-auto mb-4 opacity-20" />
                <p>У вас пока нет треков</p>
                <p className="text-sm">Добавьте музыку, чтобы слушать её здесь</p>
              </div>
            ) : (
              tracks.map((track) => (
                <div
                  key={track.id}
                  className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors ${
                    currentTrack?.id === track.id ? 'bg-muted' : ''
                  }`}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handlePlayTrack(track)}
                    className="shrink-0"
                  >
                    <Icon
                      name={currentTrack?.id === track.id && isPlaying ? 'Pause' : 'Play'}
                      size={16}
                    />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{track.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{track.duration}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteTrack(track.id)}
                    className="shrink-0 text-destructive hover:text-destructive"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

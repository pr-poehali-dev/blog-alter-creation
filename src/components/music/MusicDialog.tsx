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
  playlistId?: string;
}

interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
}

interface MusicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export default function MusicDialog({ open, onOpenChange, user }: MusicDialogProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPlaylistForm, setShowPlaylistForm] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [view, setView] = useState<'all' | 'playlists'>('all');

  const handleAddTrack = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTrack: Track = {
      id: Date.now().toString(),
      title: formData.get('title') as string,
      artist: formData.get('artist') as string,
      url: formData.get('url') as string,
      duration: '3:45',
      playlistId: selectedPlaylist || undefined,
    };
    setTracks([...tracks, newTrack]);
    
    if (selectedPlaylist) {
      setPlaylists(playlists.map(p => 
        p.id === selectedPlaylist 
          ? { ...p, trackIds: [...p.trackIds, newTrack.id] }
          : p
      ));
    }
    
    setShowAddForm(false);
    e.currentTarget.reset();
  };

  const handleCreatePlaylist = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      trackIds: [],
    };
    setPlaylists([...playlists, newPlaylist]);
    setShowPlaylistForm(false);
    e.currentTarget.reset();
  };

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handleDeleteTrack = (trackId: string) => {
    setTracks(tracks.filter(t => t.id !== trackId));
    setPlaylists(playlists.map(p => ({
      ...p,
      trackIds: p.trackIds.filter(id => id !== trackId)
    })));
    if (currentTrack?.id === trackId) {
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter(p => p.id !== playlistId));
    if (selectedPlaylist === playlistId) {
      setSelectedPlaylist(null);
    }
  };

  const handleAddToPlaylist = (trackId: string, playlistId: string) => {
    setPlaylists(playlists.map(p => 
      p.id === playlistId 
        ? { ...p, trackIds: [...p.trackIds, trackId] }
        : p
    ));
  };

  const getPlaylistTracks = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return [];
    return tracks.filter(t => playlist.trackIds.includes(t.id));
  };

  const displayTracks = selectedPlaylist 
    ? getPlaylistTracks(selectedPlaylist)
    : tracks;

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Music" size={20} />
            Моя музыка
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 border-b pb-2">
          <Button
            size="sm"
            variant={view === 'all' ? 'default' : 'ghost'}
            onClick={() => { setView('all'); setSelectedPlaylist(null); }}
          >
            <Icon name="Music" size={16} className="mr-2" />
            Все треки
          </Button>
          <Button
            size="sm"
            variant={view === 'playlists' ? 'default' : 'ghost'}
            onClick={() => setView('playlists')}
          >
            <Icon name="ListMusic" size={16} className="mr-2" />
            Плейлисты ({playlists.length})
          </Button>
        </div>

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

          {view === 'playlists' ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {selectedPlaylist 
                    ? playlists.find(p => p.id === selectedPlaylist)?.name 
                    : 'Мои плейлисты'}
                </h3>
                <div className="flex gap-2">
                  {selectedPlaylist && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedPlaylist(null)}
                    >
                      <Icon name="ArrowLeft" size={16} className="mr-2" />
                      Назад
                    </Button>
                  )}
                  {!selectedPlaylist && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowPlaylistForm(!showPlaylistForm)}
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Создать
                    </Button>
                  )}
                  {selectedPlaylist && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAddForm(!showAddForm)}
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить трек
                    </Button>
                  )}
                </div>
              </div>

              {showPlaylistForm && (
                <form onSubmit={handleCreatePlaylist} className="bg-muted p-4 rounded-lg space-y-3">
                  <Input name="name" placeholder="Название плейлиста" required />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="flex-1">
                      <Icon name="Check" size={16} className="mr-2" />
                      Создать
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowPlaylistForm(false)}
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              )}

              {selectedPlaylist ? (
                <>
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
                    {displayTracks.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Icon name="Music" size={48} className="mx-auto mb-4 opacity-20" />
                        <p>В плейлисте пока нет треков</p>
                      </div>
                    ) : (
                      displayTracks.map((track) => (
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
                </>
              ) : (
                <div className="space-y-2">
                  {playlists.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Icon name="ListMusic" size={48} className="mx-auto mb-4 opacity-20" />
                      <p>У вас пока нет плейлистов</p>
                      <p className="text-sm">Создайте плейлист для группировки треков</p>
                    </div>
                  ) : (
                    playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className="flex items-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedPlaylist(playlist.id)}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                          <Icon name="ListMusic" size={24} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{playlist.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {playlist.trackIds.length} {playlist.trackIds.length === 1 ? 'трек' : 'треков'}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlaylist(playlist.id);
                          }}
                          className="shrink-0 text-destructive hover:text-destructive"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Все треки ({tracks.length})</h3>
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

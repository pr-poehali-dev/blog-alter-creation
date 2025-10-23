import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { User } from '@/lib/types';
import { Track, Playlist } from './types';
import NowPlaying from './NowPlaying';
import AddTrackForm from './AddTrackForm';
import CreatePlaylistForm from './CreatePlaylistForm';
import TrackItem from './TrackItem';
import PlaylistItem from './PlaylistItem';
import EmptyState from './EmptyState';
import SearchBar from './SearchBar';
import SortMenu, { SortOption } from './SortMenu';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');

  const handleAddTrack = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const audioUrl = formData.get('audioUrl') as string;
    
    if (!audioUrl) {
      alert('Пожалуйста, выберите аудиофайл');
      return;
    }
    
    const newTrack: Track = {
      id: Date.now().toString(),
      title: formData.get('title') as string,
      artist: formData.get('artist') as string,
      url: audioUrl,
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

  const handleMoveToPlaylist = (trackId: string, fromPlaylistId: string | null, toPlaylistId: string) => {
    if (fromPlaylistId) {
      setPlaylists(playlists.map(p => {
        if (p.id === fromPlaylistId) {
          return { ...p, trackIds: p.trackIds.filter(id => id !== trackId) };
        }
        if (p.id === toPlaylistId) {
          return { ...p, trackIds: [...p.trackIds, trackId] };
        }
        return p;
      }));
    } else {
      setPlaylists(playlists.map(p => 
        p.id === toPlaylistId 
          ? { ...p, trackIds: [...p.trackIds, trackId] }
          : p
      ));
    }
  };

  const handleRemoveFromPlaylist = (trackId: string, playlistId: string) => {
    setPlaylists(playlists.map(p => 
      p.id === playlistId 
        ? { ...p, trackIds: p.trackIds.filter(id => id !== trackId) }
        : p
    ));
  };

  const getTrackPlaylist = (trackId: string): string | null => {
    const playlist = playlists.find(p => p.trackIds.includes(trackId));
    return playlist ? playlist.id : null;
  };

  const getPlaylistTracks = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return [];
    return tracks.filter(t => playlist.trackIds.includes(t.id));
  };

  const filterTracks = (trackList: Track[]) => {
    if (!searchQuery.trim()) return trackList;
    const query = searchQuery.toLowerCase();
    return trackList.filter(track => 
      track.title.toLowerCase().includes(query) || 
      track.artist.toLowerCase().includes(query)
    );
  };

  const sortTracks = (trackList: Track[]) => {
    const sorted = [...trackList];
    switch (sortOption) {
      case 'date-desc':
        return sorted.reverse();
      case 'date-asc':
        return sorted;
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title, 'ru'));
      case 'artist-asc':
        return sorted.sort((a, b) => a.artist.localeCompare(b.artist, 'ru'));
      case 'artist-desc':
        return sorted.sort((a, b) => b.artist.localeCompare(a.artist, 'ru'));
      default:
        return sorted;
    }
  };

  const displayTracks = useMemo(() => {
    const baseList = selectedPlaylist 
      ? getPlaylistTracks(selectedPlaylist)
      : tracks;
    const filtered = filterTracks(baseList);
    return sortTracks(filtered);
  }, [selectedPlaylist, tracks, searchQuery, sortOption, playlists]);

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
          <NowPlaying
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
          />

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
                <CreatePlaylistForm
                  onSubmit={handleCreatePlaylist}
                  onCancel={() => setShowPlaylistForm(false)}
                />
              )}

              {selectedPlaylist ? (
                <>
                  {showAddForm && (
                    <AddTrackForm
                      onSubmit={handleAddTrack}
                      onCancel={() => setShowAddForm(false)}
                    />
                  )}

                  <div className="flex gap-2">
                    <SearchBar
                      value={searchQuery}
                      onChange={setSearchQuery}
                    />
                    <SortMenu
                      currentSort={sortOption}
                      onSortChange={setSortOption}
                    />
                  </div>

                  <div className="space-y-2">
                    {displayTracks.length === 0 ? (
                      <EmptyState
                        icon="Music"
                        title={searchQuery ? "Треки не найдены" : "В плейлисте пока нет треков"}
                        description={searchQuery ? "Попробуйте изменить поисковый запрос" : undefined}
                      />
                    ) : (
                      displayTracks.map((track) => (
                        <TrackItem
                          key={track.id}
                          track={track}
                          isPlaying={isPlaying}
                          isCurrent={currentTrack?.id === track.id}
                          playlists={playlists}
                          currentPlaylistId={selectedPlaylist}
                          onPlay={handlePlayTrack}
                          onDelete={handleDeleteTrack}
                          onMoveToPlaylist={handleMoveToPlaylist}
                          onRemoveFromPlaylist={handleRemoveFromPlaylist}
                        />
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  {playlists.length === 0 ? (
                    <EmptyState
                      icon="ListMusic"
                      title="У вас пока нет плейлистов"
                      description="Создайте плейлист для группировки треков"
                    />
                  ) : (
                    playlists.map((playlist) => (
                      <PlaylistItem
                        key={playlist.id}
                        playlist={playlist}
                        onClick={() => setSelectedPlaylist(playlist.id)}
                        onDelete={handleDeletePlaylist}
                      />
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
                <AddTrackForm
                  onSubmit={handleAddTrack}
                  onCancel={() => setShowAddForm(false)}
                />
              )}

              <div className="flex gap-2">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
                <SortMenu
                  currentSort={sortOption}
                  onSortChange={setSortOption}
                />
              </div>

              <div className="space-y-2">
                {tracks.length === 0 ? (
                  <EmptyState
                    icon="Music"
                    title="У вас пока нет треков"
                    description="Добавьте музыку, чтобы слушать её здесь"
                  />
                ) : displayTracks.length === 0 ? (
                  <EmptyState
                    icon="Search"
                    title="Треки не найдены"
                    description="Попробуйте изменить поисковый запрос"
                  />
                ) : (
                  displayTracks.map((track) => {
                    const currentPlaylistId = getTrackPlaylist(track.id);
                    return (
                      <TrackItem
                        key={track.id}
                        track={track}
                        isPlaying={isPlaying}
                        isCurrent={currentTrack?.id === track.id}
                        playlists={playlists}
                        currentPlaylistId={currentPlaylistId}
                        showPlaylistMenu={true}
                        onPlay={handlePlayTrack}
                        onDelete={handleDeleteTrack}
                        onMoveToPlaylist={handleMoveToPlaylist}
                        onRemoveFromPlaylist={handleRemoveFromPlaylist}
                      />
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
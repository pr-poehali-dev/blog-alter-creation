import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Track, Playlist } from './types';

interface TrackItemProps {
  track: Track;
  isPlaying: boolean;
  isCurrent: boolean;
  playlists: Playlist[];
  currentPlaylistId: string | null;
  showPlaylistMenu?: boolean;
  onPlay: (track: Track) => void;
  onDelete: (trackId: string) => void;
  onMoveToPlaylist?: (trackId: string, fromPlaylistId: string | null, toPlaylistId: string) => void;
  onRemoveFromPlaylist?: (trackId: string, playlistId: string) => void;
}

export default function TrackItem({
  track,
  isPlaying,
  isCurrent,
  playlists,
  currentPlaylistId,
  showPlaylistMenu = false,
  onPlay,
  onDelete,
  onMoveToPlaylist,
  onRemoveFromPlaylist,
}: TrackItemProps) {
  const playlistName = currentPlaylistId 
    ? playlists.find(p => p.id === currentPlaylistId)?.name 
    : null;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors ${
        isCurrent ? 'bg-muted' : ''
      }`}
    >
      <Button size="icon" variant="ghost" onClick={() => onPlay(track)} className="shrink-0">
        <Icon name={isCurrent && isPlaying ? 'Pause' : 'Play'} size={16} />
      </Button>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{track.title}</p>
        <p className="text-xs text-muted-foreground truncate">
          {track.artist}
          {showPlaylistMenu && playlistName && (
            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
              {playlistName}
            </span>
          )}
        </p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{track.duration}</span>

      {showPlaylistMenu && playlists.length > 0 && onMoveToPlaylist && onRemoveFromPlaylist && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="shrink-0">
              <Icon name="FolderInput" size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {currentPlaylistId ? 'Переместить в' : 'Добавить в плейлист'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {playlists
              .filter(p => p.id !== currentPlaylistId)
              .map(playlist => (
                <DropdownMenuItem
                  key={playlist.id}
                  onClick={() => onMoveToPlaylist(track.id, currentPlaylistId, playlist.id)}
                >
                  <Icon name="ListMusic" size={14} className="mr-2" />
                  {playlist.name}
                </DropdownMenuItem>
              ))}
            {currentPlaylistId && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onRemoveFromPlaylist(track.id, currentPlaylistId)}
                >
                  <Icon name="FolderMinus" size={14} className="mr-2" />
                  Убрать из плейлиста
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {!showPlaylistMenu && onMoveToPlaylist && onRemoveFromPlaylist && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="shrink-0">
              <Icon name="MoreVertical" size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Переместить в</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {playlists
              .filter(p => p.id !== currentPlaylistId)
              .map(playlist => (
                <DropdownMenuItem
                  key={playlist.id}
                  onClick={() => onMoveToPlaylist(track.id, currentPlaylistId, playlist.id)}
                >
                  <Icon name="ListMusic" size={14} className="mr-2" />
                  {playlist.name}
                </DropdownMenuItem>
              ))}
            {playlists.filter(p => p.id !== currentPlaylistId).length === 0 && (
              <DropdownMenuItem disabled>Нет других плейлистов</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => currentPlaylistId && onRemoveFromPlaylist(track.id, currentPlaylistId)}
            >
              <Icon name="FolderMinus" size={14} className="mr-2" />
              Убрать из плейлиста
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Button
        size="icon"
        variant="ghost"
        onClick={() => onDelete(track.id)}
        className="shrink-0 text-destructive hover:text-destructive"
      >
        <Icon name="Trash2" size={16} />
      </Button>
    </div>
  );
}

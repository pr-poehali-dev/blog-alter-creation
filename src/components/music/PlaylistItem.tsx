import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Playlist } from './types';

interface PlaylistItemProps {
  playlist: Playlist;
  onClick: () => void;
  onDelete: (playlistId: string) => void;
}

export default function PlaylistItem({ playlist, onClick, onDelete }: PlaylistItemProps) {
  return (
    <div
      className="flex items-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={onClick}
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
          onDelete(playlist.id);
        }}
        className="shrink-0 text-destructive hover:text-destructive"
      >
        <Icon name="Trash2" size={16} />
      </Button>
    </div>
  );
}

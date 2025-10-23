import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Track } from './types';

interface NowPlayingProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export default function NowPlaying({ currentTrack, isPlaying, onTogglePlay }: NowPlayingProps) {
  if (!currentTrack) return null;

  return (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
          <Icon name="Music2" size={24} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{currentTrack.title}</h4>
          <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
        </div>
        <Button size="icon" variant="ghost" onClick={onTogglePlay}>
          <Icon name={isPlaying ? 'Pause' : 'Play'} size={20} />
        </Button>
      </div>
    </div>
  );
}

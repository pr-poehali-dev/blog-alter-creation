export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: string;
  playlistId?: string;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
}

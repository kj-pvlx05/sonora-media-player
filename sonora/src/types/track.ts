export type ArtworkStyle =
  | "synthwave"
  | "ambient"
  | "pop"
  | "acoustic"
  | "electronic"
  | "retro"
  | "psychedelic"
  | "classic";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  durationSec: number;
  audioSrc?: string; // Real HTML5 Audio source path (e.g. /audio/night-drive.wav)
  coverImage?: string;
  artworkStyle: ArtworkStyle;
  artworkPalette: {
    bg: string;
    fg: string;
    accent: string;
    accentSecondary: string;
  };
  trackNumber: string;
  format: string;
  bitrate: string;
  isFavorite: boolean;
  category: "electronic" | "ambient" | "pop" | "indie" | "rock";
  year: number;
}

export interface QueueItem {
  queueId: string;
  track: Track;
  addedAt: number;
}

export interface HistoryEntry {
  id: string;
  track: Track;
  playedAt: number;
}

export type PlaybackStatus = "idle" | "loading" | "playing" | "paused" | "error";

export type LibraryFilter = "all" | "favorites" | "artists" | "albums";

export type NavSection =
  | "home"
  | "library"
  | "queue"
  | "recent"
  | "visualizer"
  | "about";

"use client";

import { useState, useMemo } from "react";
import { Track, LibraryFilter } from "@/types/track";
import { AlbumArtwork } from "@/components/player/album-artwork";
import { Search, Plus, MoreHorizontal, Clock, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface MusicLibraryProps {
  tracks: Track[];
  currentTrack: Track;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  favorites: Set<string>;
  onToggleFavorite: (trackId: string) => void;
  searchRef?: React.RefObject<HTMLInputElement | null>;
  className?: string;
}

export function MusicLibrary({
  tracks,
  currentTrack,
  onPlayTrack,
  onAddToQueue,
  favorites,
  onToggleFavorite,
  searchRef,
  className,
}: MusicLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>("all");
  const [sortBy, setSortBy] = useState<"default" | "title" | "artist" | "duration">("default");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Filter and sort tracks based on state
  const filteredTracks = useMemo(() => {
    let result = [...tracks];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    // Category / Tab filter
    if (activeFilter === "favorites") {
      result = result.filter((t) => favorites.has(t.id));
    } else if (activeFilter === "artists") {
      result.sort((a, b) => a.artist.localeCompare(b.artist));
    } else if (activeFilter === "albums") {
      result.sort((a, b) => a.album.localeCompare(b.album));
    }

    // Additional manual sorting
    if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "artist") {
      result.sort((a, b) => a.artist.localeCompare(b.artist));
    } else if (sortBy === "duration") {
      result.sort((a, b) => b.durationSec - a.durationSec);
    }

    return result;
  }, [tracks, searchQuery, activeFilter, sortBy, favorites]);

  const filterTabs: { id: LibraryFilter; label: string }[] = [
    { id: "all", label: "ALL" },
    { id: "favorites", label: "FAVOURITES" },
    { id: "artists", label: "ARTISTS" },
    { id: "albums", label: "ALBUMS" },
  ];

  return (
    <section
      aria-label="Music Library"
      className={cn(
        "flex flex-col gap-1.5 p-3 sm:p-3.5 bg-surface border border-border rounded-2xl shadow-xs select-none min-h-0",
        className
      )}
    >
      {/* 1. Header Bar: Title + Filter Tabs + Search + Sort Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-1.5 shrink-0">
        {/* Title & Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xs sm:text-[13px] font-bold font-mono tracking-wider text-foreground uppercase">
            YOUR LIBRARY
          </h2>

          <div className="flex items-center gap-1.5">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "px-3 py-0.5 rounded-full text-[9.5px] font-mono font-bold tracking-wider transition-all cursor-pointer",
                    isActive
                      ? "bg-[#181818] text-white dark:bg-white dark:text-[#181818] shadow-xs"
                      : "bg-surface-alt/80 hover:bg-surface-sunken text-[#66645E] dark:text-[#A6A49E] hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Field & Sort Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Field */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#99958C] pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs, artists..."
              aria-label="Search songs and artists"
              className="w-full pl-7 pr-3 py-1 text-[11px] bg-surface-alt/60 border border-border/80 hover:border-border-strong focus:border-accent rounded-full text-foreground placeholder:text-[#99958C] focus:outline-none transition-colors font-sans"
            />
          </div>

          {/* Sort Menu Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              title="Sort Table"
              aria-label="Sort table options"
              className={cn(
                "p-1.5 rounded-md hover:bg-surface-alt text-foreground transition-colors cursor-pointer",
                sortBy !== "default" && "bg-surface-alt border-accent text-accent"
              )}
            >
              <Menu className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>

            {/* Sort Popover */}
            {showSortDropdown && (
              <div className="absolute right-0 mt-1 w-36 bg-surface border border-border rounded-md shadow-md py-1 z-30 text-xs font-mono">
                {[
                  { id: "default", label: "Default" },
                  { id: "title", label: "Title (A-Z)" },
                  { id: "artist", label: "Artist (A-Z)" },
                  { id: "duration", label: "Duration" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.id as typeof sortBy);
                      setShowSortDropdown(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 hover:bg-surface-alt transition-colors",
                      sortBy === opt.id ? "text-accent font-bold" : "text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Compact Library Table (Fits all 8 rows cleanly) */}
      <div className="w-full flex-1 min-h-0 overflow-y-auto">
        <table className="w-full text-left border-collapse text-[11px] font-sans">
          <thead>
            <tr className="border-b border-border-subtle text-[9px] font-mono font-bold text-muted uppercase tracking-wider">
              <th className="py-1 px-2 w-8 text-center">#</th>
              <th className="py-1 px-2 w-[32%]">TITLE</th>
              <th className="py-1 px-2 w-[24%]">ARTIST</th>
              <th className="py-1 px-2 w-[24%]">ALBUM</th>
              <th className="py-1 px-2 w-14 text-center">
                <Clock className="w-3 h-3 inline text-muted" />
              </th>
              <th className="py-1 px-2 w-10 text-center">ADD</th>
              <th className="py-1 px-1.5 w-8 text-center" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/40">
            {filteredTracks.map((track, idx) => {
              const isCurrent = currentTrack.id === track.id;
              const rowNum = String(idx + 1).padStart(2, "0");

              return (
                <tr
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  className={cn(
                    "group hover:bg-surface-alt/70 transition-colors cursor-pointer",
                    isCurrent && "bg-surface-alt/40"
                  )}
                >
                  {/* # Column */}
                  <td className="py-0.5 sm:py-1 px-2 text-center font-mono text-[9.5px]">
                    <span
                      className={cn(
                        "transition-colors",
                        isCurrent
                          ? "text-accent font-bold"
                          : "text-muted group-hover:text-foreground"
                      )}
                    >
                      {rowNum}
                    </span>
                  </td>

                  {/* Artwork Thumbnail + Title */}
                  <td className="py-0.5 sm:py-1 px-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AlbumArtwork
                        track={track}
                        size="xs"
                        className="rounded-xs shrink-0 border border-border-subtle"
                      />
                      <span
                        className={cn(
                          "truncate font-medium transition-colors text-[11px]",
                          isCurrent
                            ? "text-accent font-semibold"
                            : "text-foreground group-hover:text-foreground"
                        )}
                      >
                        {track.title}
                      </span>
                    </div>
                  </td>

                  {/* Artist */}
                  <td className="py-0.5 sm:py-1 px-2 text-muted truncate max-w-[130px] text-[10.5px]">
                    {track.artist}
                  </td>

                  {/* Album */}
                  <td className="py-0.5 sm:py-1 px-2 text-muted truncate max-w-[160px] text-[10.5px]">
                    {track.album}
                  </td>

                  {/* Duration */}
                  <td className="py-0.5 sm:py-1 px-2 font-mono text-[9.5px] text-muted text-center">
                    {track.duration}
                  </td>

                  {/* Add to Queue Button */}
                  <td className="py-0.5 sm:py-1 px-2 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToQueue(track);
                      }}
                      title="Add to queue"
                      aria-label={`Add ${track.title} to queue`}
                      className="w-4 h-4 rounded-xs bg-surface-alt hover:bg-surface-sunken active:bg-[#171717] active:text-white border border-border-subtle inline-flex items-center justify-center text-foreground transition-colors"
                    >
                      <Plus className="w-2.5 h-2.5 stroke-[2.2]" />
                    </button>
                  </td>

                  {/* More Options Button */}
                  <td className="py-0.5 sm:py-1 px-1.5 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(track.id);
                      }}
                      title={
                        favorites.has(track.id)
                          ? "Remove from favourites"
                          : "Save to favourites"
                      }
                      aria-label="More options"
                      className="text-muted hover:text-foreground p-0.5 transition-colors inline-flex items-center justify-center"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

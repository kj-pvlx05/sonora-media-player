package com.sonora.model;

/**
 * Core domain record representing an audio track in the SONORA ecosystem.
 * Matches the frontend Track interface in strict type correspondence.
 */
public class MediaRecord {
    private String id;
    private String title;
    private String artist;
    private String album;
    private String duration;
    private int durationSec;
    private String audioSrc;
    private String coverImage;
    private String artworkStyle;
    private ArtworkPalette artworkPalette;
    private String trackNumber;
    private String format;
    private String bitrate;
    private boolean isFavorite;
    private String category;
    private int year;

    public static class ArtworkPalette {
        private String bg;
        private String fg;
        private String accent;
        private String accentSecondary;

        public ArtworkPalette() {}

        public ArtworkPalette(String bg, String fg, String accent, String accentSecondary) {
            this.bg = bg;
            this.fg = fg;
            this.accent = accent;
            this.accentSecondary = accentSecondary;
        }

        public String getBg() { return bg; }
        public void setBg(String bg) { this.bg = bg; }
        public String getFg() { return fg; }
        public void setFg(String fg) { this.fg = fg; }
        public String getAccent() { return accent; }
        public void setAccent(String accent) { this.accent = accent; }
        public String getAccentSecondary() { return accentSecondary; }
        public void setAccentSecondary(String accentSecondary) { this.accentSecondary = accentSecondary; }
    }

    public MediaRecord() {
    }

    public MediaRecord(String id, String title, String artist, String album, String duration,
                       int durationSec, String audioSrc, String category, String format,
                       String bitrate, int year, String trackNumber) {
        this(id, title, artist, album, duration, durationSec, audioSrc, null, "synthwave",
             null, trackNumber, format, bitrate, false, category, year);
    }

    public MediaRecord(String id, String title, String artist, String album, String duration,
                       int durationSec, String audioSrc, String coverImage, String artworkStyle,
                       ArtworkPalette artworkPalette, String trackNumber, String format,
                       String bitrate, boolean isFavorite, String category, int year) {
        this.id = id;
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.duration = duration;
        this.durationSec = durationSec;
        this.audioSrc = audioSrc;
        this.coverImage = coverImage;
        this.artworkStyle = artworkStyle;
        this.artworkPalette = artworkPalette;
        this.trackNumber = trackNumber;
        this.format = format;
        this.bitrate = bitrate;
        this.isFavorite = isFavorite;
        this.category = category;
        this.year = year;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getArtist() { return artist; }
    public void setArtist(String artist) { this.artist = artist; }

    public String getAlbum() { return album; }
    public void setAlbum(String album) { this.album = album; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public int getDurationSec() { return durationSec; }
    public void setDurationSec(int durationSec) { this.durationSec = durationSec; }

    public String getAudioSrc() { return audioSrc; }
    public void setAudioSrc(String audioSrc) { this.audioSrc = audioSrc; }

    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

    public String getArtworkStyle() { return artworkStyle; }
    public void setArtworkStyle(String artworkStyle) { this.artworkStyle = artworkStyle; }

    public ArtworkPalette getArtworkPalette() { return artworkPalette; }
    public void setArtworkPalette(ArtworkPalette artworkPalette) { this.artworkPalette = artworkPalette; }

    public String getTrackNumber() { return trackNumber; }
    public void setTrackNumber(String trackNumber) { this.trackNumber = trackNumber; }

    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }

    public String getBitrate() { return bitrate; }
    public void setBitrate(String bitrate) { this.bitrate = bitrate; }

    public boolean isFavorite() { return isFavorite; }
    public void setFavorite(boolean favorite) { isFavorite = favorite; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    @Override
    public String toString() {
        return "MediaRecord{" +
                "id='" + id + '\'' +
                ", title='" + title + '\'' +
                ", artist='" + artist + '\'' +
                ", duration='" + duration + '\'' +
                '}';
    }
}

package com.sonora.model;

/**
 * Data Transfer Object representing a playback history entry.
 * Timestamps are generated authoritatively on the backend.
 */
public class HistoryEntryDto {
    private String id;
    private MediaRecord track;
    private long playedAt;

    public HistoryEntryDto() {
    }

    public HistoryEntryDto(String id, MediaRecord track, long playedAt) {
        this.id = id;
        this.track = track;
        this.playedAt = playedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public MediaRecord getTrack() {
        return track;
    }

    public void setTrack(MediaRecord track) {
        this.track = track;
    }

    public long getPlayedAt() {
        return playedAt;
    }

    public void setPlayedAt(long playedAt) {
        this.playedAt = playedAt;
    }
}

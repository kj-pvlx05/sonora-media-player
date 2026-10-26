package com.sonora.model;

/**
 * Data Transfer Object representing an item in the active playback queue.
 */
public class QueueItemDto {
    private String queueId;
    private MediaRecord track;
    private long addedAt;

    public QueueItemDto() {
    }

    public QueueItemDto(String queueId, MediaRecord track, long addedAt) {
        this.queueId = queueId;
        this.track = track;
        this.addedAt = addedAt;
    }

    public String getQueueId() {
        return queueId;
    }

    public void setQueueId(String queueId) {
        this.queueId = queueId;
    }

    public MediaRecord getTrack() {
        return track;
    }

    public void setTrack(MediaRecord track) {
        this.track = track;
    }

    public long getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(long addedAt) {
        this.addedAt = addedAt;
    }
}

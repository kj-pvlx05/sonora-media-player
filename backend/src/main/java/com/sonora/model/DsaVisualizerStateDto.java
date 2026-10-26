package com.sonora.model;

import java.util.List;

/**
 * Data Transfer Object providing an atomic snapshot of live data structures in memory
 * for consumption by the SONORA DSA Visualizer module.
 */
public class DsaVisualizerStateDto {
    private int queueSize;
    private QueueItemDto queueHead;
    private QueueItemDto queueTail;
    private List<QueueItemDto> queueItems;

    private int playlistSize;
    private MediaRecord currentTrack;
    private List<MediaRecord> playlistItems;

    private String queueStructureType = "FIFO Queue (Linear Node-based)";
    private String listStructureType = "Doubly Linked List (Bidirectional Nodes)";

    public DsaVisualizerStateDto() {
    }

    public int getQueueSize() {
        return queueSize;
    }

    public void setQueueSize(int queueSize) {
        this.queueSize = queueSize;
    }

    public QueueItemDto getQueueHead() {
        return queueHead;
    }

    public void setQueueHead(QueueItemDto queueHead) {
        this.queueHead = queueHead;
    }

    public QueueItemDto getQueueTail() {
        return queueTail;
    }

    public void setQueueTail(QueueItemDto queueTail) {
        this.queueTail = queueTail;
    }

    public List<QueueItemDto> getQueueItems() {
        return queueItems;
    }

    public void setQueueItems(List<QueueItemDto> queueItems) {
        this.queueItems = queueItems;
    }

    public int getPlaylistSize() {
        return playlistSize;
    }

    public void setPlaylistSize(int playlistSize) {
        this.playlistSize = playlistSize;
    }

    public MediaRecord getCurrentTrack() {
        return currentTrack;
    }

    public void setCurrentTrack(MediaRecord currentTrack) {
        this.currentTrack = currentTrack;
    }

    public List<MediaRecord> getPlaylistItems() {
        return playlistItems;
    }

    public void setPlaylistItems(List<MediaRecord> playlistItems) {
        this.playlistItems = playlistItems;
    }

    public String getQueueStructureType() {
        return queueStructureType;
    }

    public void setQueueStructureType(String queueStructureType) {
        this.queueStructureType = queueStructureType;
    }

    public String getListStructureType() {
        return listStructureType;
    }

    public void setListStructureType(String listStructureType) {
        this.listStructureType = listStructureType;
    }
}

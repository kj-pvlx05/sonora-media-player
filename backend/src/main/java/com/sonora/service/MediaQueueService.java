package com.sonora.service;

import com.sonora.dsa.list.MediaLinkedList;
import com.sonora.dsa.queue.PlaybackQueue;
import com.sonora.model.DsaVisualizerStateDto;
import com.sonora.model.HistoryEntryDto;
import com.sonora.model.MediaRecord;
import com.sonora.model.QueueItemDto;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Core OOP Service orchestrating the PlaybackQueue (FIFO) and MediaLinkedList
 * (Doubly Linked List) over Media Records and playback history.
 */
@Service
public class MediaQueueService {

    private final PlaybackQueue<QueueItemDto> playbackQueue = new PlaybackQueue<>();
    private final MediaLinkedList<MediaRecord> mediaLinkedList = new MediaLinkedList<>();
    private final Map<String, MediaRecord> mediaCatalog = new LinkedHashMap<>();
    private final List<HistoryEntryDto> playbackHistory = new ArrayList<>();

    public MediaQueueService() {
        initializeCatalogAndDataStructures();
    }

    /**
     * Seed initial catalog, playlist linked list, and playback queue matching SONORA frontend.
     */
    private void initializeCatalogAndDataStructures() {
        List<MediaRecord> initialTracks = List.of(
            new MediaRecord("trk-01", "Night Drive", "The Midnight", "Endless Summer",
                "04:12", 252, "/audio/night-drive.wav", "/artwork/night-drive.jpg", "synthwave",
                new MediaRecord.ArtworkPalette("#160D27", "#FDF2F8", "#E54848", "#A855F7"),
                "TRK 01/08", "FLAC 24-bit / 96.0kHz", "3,211 kbps", true, "electronic", 2016),
            new MediaRecord("trk-02", "Aurora", "C418", "Minecraft - Volume Alpha",
                "03:45", 225, "/audio/aurora.wav", "/artwork/aurora.jpg", "ambient",
                new MediaRecord.ArtworkPalette("#0B1E1D", "#E0F2FE", "#14B8A6", "#065F46"),
                "TRK 02/08", "WAV 16-bit / 44.1kHz", "1,411 kbps", true, "ambient", 2011),
            new MediaRecord("trk-03", "Blush", "JVKE", "this is what falling in love feels like",
                "02:58", 178, null, "/artwork/blush.jpg", "pop",
                new MediaRecord.ArtworkPalette("#2A1215", "#FFE4E6", "#FB7185", "#9F1239"),
                "TRK 03/08", "ALAC 24-bit / 48.0kHz", "1,680 kbps", false, "pop", 2022),
            new MediaRecord("trk-04", "Heaven", "Niall Horan", "Flicker",
                "03:24", 204, null, "/artwork/heaven.jpg", "pop",
                new MediaRecord.ArtworkPalette("#1E1B18", "#FEF3C7", "#F59E0B", "#78350F"),
                "TRK 04/08", "FLAC 16-bit / 44.1kHz", "945 kbps", false, "pop", 2023),
            new MediaRecord("trk-05", "The Nights", "Avicii", "The Days / The Nights",
                "04:37", 277, null, "/artwork/the-nights.jpg", "electronic",
                new MediaRecord.ArtworkPalette("#1C1917", "#FEF08A", "#EAB308", "#854D0E"),
                "TRK 05/08", "FLAC 24-bit / 44.1kHz", "1,520 kbps", true, "electronic", 2014),
            new MediaRecord("trk-06", "Starboy", "The Weeknd", "Starboy",
                "03:50", 230, null, "/artwork/starboy.jpg", "pop",
                new MediaRecord.ArtworkPalette("#18181B", "#FCA5A5", "#EF4444", "#7F1D1D"),
                "TRK 06/08", "FLAC 24-bit / 96.0kHz", "3,040 kbps", false, "pop", 2016),
            new MediaRecord("trk-07", "Heat Waves", "Glass Animals", "Dreamland",
                "03:58", 238, null, "/artwork/heat-waves.jpg", "indie",
                new MediaRecord.ArtworkPalette("#172554", "#DDD6FE", "#8B5CF6", "#4C1D95"),
                "TRK 07/08", "FLAC 24-bit / 48.0kHz", "1,720 kbps", false, "indie", 2020),
            new MediaRecord("trk-08", "Somewhere Only We Know", "Keane", "Hopes and Fears",
                "03:56", 236, null, "/artwork/somewhere-only-we-know.jpg", "rock",
                new MediaRecord.ArtworkPalette("#1E293B", "#CBD5E1", "#64748B", "#0F172A"),
                "TRK 08/08", "FLAC 16-bit / 44.1kHz", "1,012 kbps", false, "rock", 2004)
        );

        for (MediaRecord track : initialTracks) {
            mediaCatalog.put(track.getId(), track);
            mediaLinkedList.addLast(track);
        }

        // Set initial playlist cursor to Night Drive
        mediaLinkedList.setCurrentById(MediaRecord::getId, "trk-01");

        // Seed initial playback queue with 4 upcoming tracks matching reference
        long now = 1761400000000L;
        playbackQueue.enqueue(new QueueItemDto("q-1", mediaCatalog.get("trk-02"), now - 400000));
        playbackQueue.enqueue(new QueueItemDto("q-2", mediaCatalog.get("trk-03"), now - 300000));
        playbackQueue.enqueue(new QueueItemDto("q-3", mediaCatalog.get("trk-04"), now - 200000));
        playbackQueue.enqueue(new QueueItemDto("q-4", mediaCatalog.get("trk-05"), now - 100000));

        // Seed initial history
        playbackHistory.add(new HistoryEntryDto("hist-0-trk-01", mediaCatalog.get("trk-01"), now - 60000));
        playbackHistory.add(new HistoryEntryDto("hist-1-trk-08", mediaCatalog.get("trk-08"), now - 120000));
        playbackHistory.add(new HistoryEntryDto("hist-2-trk-07", mediaCatalog.get("trk-07"), now - 180000));
    }

    // ==========================================
    // Media Catalog Operations
    // ==========================================

    public synchronized List<MediaRecord> getAllMediaRecords() {
        return new ArrayList<>(mediaCatalog.values());
    }

    public synchronized Optional<MediaRecord> getMediaRecordById(String id) {
        return Optional.ofNullable(mediaCatalog.get(id));
    }

    // ==========================================
    // PlaybackQueue (Custom FIFO Queue) Operations
    // ==========================================

    public synchronized List<QueueItemDto> getQueue() {
        return playbackQueue.toList();
    }

    public synchronized QueueItemDto enqueue(String trackId) {
        MediaRecord record = mediaCatalog.get(trackId);
        if (record == null) {
            throw new IllegalArgumentException("Track not found: " + trackId);
        }

        String queueId = "q-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4);
        QueueItemDto queueItem = new QueueItemDto(queueId, record, System.currentTimeMillis());
        playbackQueue.enqueue(queueItem);
        return queueItem;
    }

    public synchronized Optional<QueueItemDto> dequeue() {
        if (playbackQueue.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(playbackQueue.dequeue());
    }

    public synchronized Optional<QueueItemDto> peekQueue() {
        return Optional.ofNullable(playbackQueue.peek());
    }

    public synchronized boolean removeFromQueue(String queueId) {
        return playbackQueue.removeById(QueueItemDto::getQueueId, queueId);
    }

    public synchronized void clearQueue() {
        playbackQueue.clear();
    }

    public synchronized boolean reorderQueue(int fromIndex, int toIndex) {
        return playbackQueue.reorder(fromIndex, toIndex);
    }

    public synchronized int getQueueSize() {
        return playbackQueue.size();
    }

    // ==========================================
    // MediaLinkedList (Custom Doubly Linked List) Operations
    // ==========================================

    public synchronized List<MediaRecord> getPlaylist() {
        return mediaLinkedList.toList();
    }

    public synchronized MediaRecord getCurrentPlaylistTrack() {
        return mediaLinkedList.getCurrent();
    }

    public synchronized MediaRecord nextPlaylistTrack(boolean loop) {
        return mediaLinkedList.next(loop);
    }

    public synchronized MediaRecord previousPlaylistTrack(boolean loop) {
        return mediaLinkedList.previous(loop);
    }

    public synchronized boolean setCurrentPlaylistTrack(String trackId) {
        return mediaLinkedList.setCurrentById(MediaRecord::getId, trackId);
    }

    // ==========================================
    // Playback History Operations
    // ==========================================

    public synchronized HistoryEntryDto recordPlayback(String trackId) {
        MediaRecord record = mediaCatalog.get(trackId);
        if (record == null) {
            throw new IllegalArgumentException("Unknown track ID: " + trackId);
        }

        long now = System.currentTimeMillis();
        String id = "hist-" + now + "-" + trackId;
        HistoryEntryDto entry = new HistoryEntryDto(id, record, now);

        // Deduplicate existing entry for same track and insert at head (most recent)
        playbackHistory.removeIf(h -> h.getTrack().getId().equals(trackId));
        playbackHistory.add(0, entry);

        // Keep bounded history of 10 tracks
        if (playbackHistory.size() > 10) {
            playbackHistory.remove(playbackHistory.size() - 1);
        }
        return entry;
    }

    public synchronized List<HistoryEntryDto> getHistory() {
        return new ArrayList<>(playbackHistory);
    }

    // ==========================================
    // DSA Visualizer State Snapshot (Atomic)
    // ==========================================

    public synchronized DsaVisualizerStateDto getVisualizerState() {
        DsaVisualizerStateDto state = new DsaVisualizerStateDto();
        state.setQueueSize(playbackQueue.size());

        QueueItemDto frontItem = playbackQueue.peek();
        state.setQueueHead(frontItem);

        List<QueueItemDto> queueList = playbackQueue.toList();
        state.setQueueItems(queueList);
        if (!queueList.isEmpty()) {
            state.setQueueTail(queueList.get(queueList.size() - 1));
        }

        state.setPlaylistSize(mediaLinkedList.size());
        state.setCurrentTrack(mediaLinkedList.getCurrent());
        state.setPlaylistItems(mediaLinkedList.toList());

        return state;
    }
}

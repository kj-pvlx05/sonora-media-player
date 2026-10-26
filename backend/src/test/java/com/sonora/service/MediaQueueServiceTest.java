package com.sonora.service;

import com.sonora.model.DsaVisualizerStateDto;
import com.sonora.model.HistoryEntryDto;
import com.sonora.model.MediaRecord;
import com.sonora.model.QueueItemDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("MediaQueueService Integration & Concurrency Tests")
class MediaQueueServiceTest {

    private MediaQueueService service;

    @BeforeEach
    void setUp() {
        service = new MediaQueueService();
    }

    @Test
    @DisplayName("Should initialize catalog, playlist, and initial queue")
    void testInitialization() {
        List<MediaRecord> catalog = service.getAllMediaRecords();
        assertEquals(8, catalog.size());

        List<MediaRecord> playlist = service.getPlaylist();
        assertEquals(8, playlist.size());

        MediaRecord current = service.getCurrentPlaylistTrack();
        assertNotNull(current);
        assertEquals("trk-01", current.getId());

        List<QueueItemDto> queue = service.getQueue();
        assertEquals(3, queue.size());
    }

    @Test
    @DisplayName("Should enqueue valid track and reject non-existent track")
    void testEnqueue() {
        int initialSize = service.getQueueSize();
        QueueItemDto item = service.enqueue("trk-07");

        assertNotNull(item);
        assertEquals("trk-07", item.getTrack().getId());
        assertEquals(initialSize + 1, service.getQueueSize());

        assertThrows(IllegalArgumentException.class, () -> service.enqueue("invalid-trk-999"));
    }

    @Test
    @DisplayName("Should dequeue in strict FIFO order until empty")
    void testDequeue() {
        Optional<QueueItemDto> first = service.dequeue();
        assertTrue(first.isPresent());
        assertEquals("trk-02", first.get().getTrack().getId());

        Optional<QueueItemDto> second = service.dequeue();
        assertTrue(second.isPresent());
        assertEquals("trk-06", second.get().getTrack().getId());

        Optional<QueueItemDto> third = service.dequeue();
        assertTrue(third.isPresent());
        assertEquals("trk-05", third.get().getTrack().getId());

        Optional<QueueItemDto> empty = service.dequeue();
        assertTrue(empty.isEmpty());
    }

    @Test
    @DisplayName("Should record playback history deterministically with deduplication")
    void testRecordHistory() {
        HistoryEntryDto h1 = service.recordPlayback("trk-01");
        assertNotNull(h1);
        assertEquals("trk-01", h1.getTrack().getId());
        assertTrue(h1.getPlayedAt() > 0);

        HistoryEntryDto h2 = service.recordPlayback("trk-02");
        assertNotNull(h2);

        List<HistoryEntryDto> history = service.getHistory();
        assertEquals("trk-02", history.get(0).getTrack().getId());
        assertEquals("trk-01", history.get(1).getTrack().getId());

        // Replaying trk-01 should deduplicate and move it to the head of history
        service.recordPlayback("trk-01");
        List<HistoryEntryDto> updatedHistory = service.getHistory();
        assertEquals("trk-01", updatedHistory.get(0).getTrack().getId());
        assertEquals("trk-02", updatedHistory.get(1).getTrack().getId());
    }

    @Test
    @DisplayName("Should provide an atomic, internally consistent DSA visualizer snapshot")
    void testVisualizerStateConsistency() {
        DsaVisualizerStateDto snapshot = service.getVisualizerState();

        assertNotNull(snapshot);
        assertEquals(snapshot.getQueueSize(), snapshot.getQueueItems().size());
        assertEquals(snapshot.getPlaylistSize(), snapshot.getPlaylistItems().size());
        assertNotNull(snapshot.getQueueHead());
        assertNotNull(snapshot.getQueueTail());
        assertEquals(snapshot.getQueueItems().get(0).getQueueId(), snapshot.getQueueHead().getQueueId());
        assertEquals(snapshot.getQueueItems().get(snapshot.getQueueItems().size() - 1).getQueueId(),
                snapshot.getQueueTail().getQueueId());
        assertNotNull(snapshot.getCurrentTrack());
    }
}

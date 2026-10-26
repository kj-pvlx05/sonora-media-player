package com.sonora.controller;

import com.sonora.model.HistoryEntryDto;
import com.sonora.model.MediaRecord;
import com.sonora.service.MediaQueueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API for Media Catalog & Doubly Linked List Playlist navigation.
 */
@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaQueueService mediaQueueService;

    public MediaController(MediaQueueService mediaQueueService) {
        this.mediaQueueService = mediaQueueService;
    }

    /**
     * GET /api/media - Get all catalog media records.
     */
    @GetMapping
    public ResponseEntity<List<MediaRecord>> getAllMedia() {
        return ResponseEntity.ok(mediaQueueService.getAllMediaRecords());
    }

    /**
     * GET /api/media/{id} - Get media record by id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<MediaRecord> getMediaById(@PathVariable String id) {
        return mediaQueueService.getMediaRecordById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/media/playlist - Get ordered playlist backed by Doubly Linked List.
     */
    @GetMapping("/playlist")
    public ResponseEntity<List<MediaRecord>> getPlaylist() {
        return ResponseEntity.ok(mediaQueueService.getPlaylist());
    }

    /**
     * GET /api/media/playlist/current - Get active track at cursor pointer.
     */
    @GetMapping("/playlist/current")
    public ResponseEntity<MediaRecord> getCurrentTrack() {
        MediaRecord current = mediaQueueService.getCurrentPlaylistTrack();
        return (current != null) ? ResponseEntity.ok(current) : ResponseEntity.noContent().build();
    }

    /**
     * POST /api/media/playlist/next?loop=true - Advance cursor to next node via Doubly Linked List.
     */
    @PostMapping("/playlist/next")
    public ResponseEntity<MediaRecord> nextTrack(@RequestParam(defaultValue = "true") boolean loop) {
        MediaRecord next = mediaQueueService.nextPlaylistTrack(loop);
        return (next != null) ? ResponseEntity.ok(next) : ResponseEntity.noContent().build();
    }

    /**
     * POST /api/media/playlist/prev?loop=true - Move cursor to previous node via Doubly Linked List.
     */
    @PostMapping("/playlist/prev")
    public ResponseEntity<MediaRecord> prevTrack(@RequestParam(defaultValue = "true") boolean loop) {
        MediaRecord prev = mediaQueueService.previousPlaylistTrack(loop);
        return (prev != null) ? ResponseEntity.ok(prev) : ResponseEntity.noContent().build();
    }

    /**
     * POST /api/media/playlist/select/{id} - Set active cursor to matching node.
     */
    @PostMapping("/playlist/select/{id}")
    public ResponseEntity<Map<String, Object>> selectTrack(@PathVariable String id) {
        boolean selected = mediaQueueService.setCurrentPlaylistTrack(id);
        return ResponseEntity.ok(Map.of("id", id, "selected", selected));
    }

    /**
     * POST /api/media/history/{id} - Record playback history (only after playback actually begins).
     */
    @PostMapping("/history/{id}")
    public ResponseEntity<HistoryEntryDto> recordHistory(@PathVariable String id) {
        try {
            HistoryEntryDto entry = mediaQueueService.recordPlayback(id);
            return ResponseEntity.ok(entry);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/media/history - Retrieve deterministic playback history from backend.
     */
    @GetMapping("/history")
    public ResponseEntity<List<HistoryEntryDto>> getHistory() {
        return ResponseEntity.ok(mediaQueueService.getHistory());
    }
}

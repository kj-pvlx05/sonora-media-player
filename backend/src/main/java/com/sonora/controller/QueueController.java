package com.sonora.controller;

import com.sonora.model.QueueItemDto;
import com.sonora.service.MediaQueueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API for custom PlaybackQueue (FIFO) operations.
 */
@RestController
@RequestMapping("/api/queue")
public class QueueController {

    private final MediaQueueService mediaQueueService;

    public QueueController(MediaQueueService mediaQueueService) {
        this.mediaQueueService = mediaQueueService;
    }

    /**
     * GET /api/queue - List current upcoming tracks in FIFO order.
     */
    @GetMapping
    public ResponseEntity<List<QueueItemDto>> getQueue() {
        return ResponseEntity.ok(mediaQueueService.getQueue());
    }

    /**
     * POST /api/queue?trackId={trackId} - Enqueue track at the tail.
     */
    @PostMapping
    public ResponseEntity<QueueItemDto> enqueue(@RequestParam String trackId) {
        try {
            QueueItemDto item = mediaQueueService.enqueue(trackId);
            return ResponseEntity.ok(item);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * POST /api/queue/dequeue - Dequeue the head track (FIFO).
     */
    @PostMapping("/dequeue")
    public ResponseEntity<QueueItemDto> dequeue() {
        return mediaQueueService.dequeue()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    /**
     * GET or POST /api/queue/peek - Inspect the head track without removing (FIFO).
     */
    @RequestMapping(value = "/peek", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<QueueItemDto> peek() {
        return mediaQueueService.peekQueue()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    /**
     * DELETE /api/queue/{queueId} - Remove a specific track from the queue.
     */
    @DeleteMapping("/{queueId}")
    public ResponseEntity<Map<String, Object>> removeFromQueue(@PathVariable String queueId) {
        boolean removed = mediaQueueService.removeFromQueue(queueId);
        return ResponseEntity.ok(Map.of("queueId", queueId, "removed", removed));
    }

    /**
     * DELETE /api/queue - Clear all items from the queue.
     */
    @DeleteMapping
    public ResponseEntity<Map<String, String>> clearQueue() {
        mediaQueueService.clearQueue();
        return ResponseEntity.ok(Map.of("message", "Queue cleared successfully"));
    }

    /**
     * POST /api/queue/reorder?fromIndex={from}&toIndex={to} - Explicit reorder of queue items.
     */
    @PostMapping("/reorder")
    public ResponseEntity<Map<String, Object>> reorderQueue(@RequestParam int fromIndex,
                                                            @RequestParam int toIndex) {
        boolean reordered = mediaQueueService.reorderQueue(fromIndex, toIndex);
        return ResponseEntity.ok(Map.of("reordered", reordered, "fromIndex", fromIndex, "toIndex", toIndex));
    }
}

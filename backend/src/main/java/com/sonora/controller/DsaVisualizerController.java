package com.sonora.controller;

import com.sonora.model.DsaVisualizerStateDto;
import com.sonora.service.MediaQueueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST API exposing live memory structure representations for the SONORA DSA Visualizer.
 */
@RestController
@RequestMapping("/api/dsa")
public class DsaVisualizerController {

    private final MediaQueueService mediaQueueService;

    public DsaVisualizerController(MediaQueueService mediaQueueService) {
        this.mediaQueueService = mediaQueueService;
    }

    /**
     * GET /api/dsa/state - Live snapshot of FIFO Queue and Doubly Linked List in memory.
     */
    @GetMapping("/state")
    public ResponseEntity<DsaVisualizerStateDto> getVisualizerState() {
        return ResponseEntity.ok(mediaQueueService.getVisualizerState());
    }
}

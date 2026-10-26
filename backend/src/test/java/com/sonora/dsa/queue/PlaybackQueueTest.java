package com.sonora.dsa.queue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("PlaybackQueue FIFO Data Structure Tests")
class PlaybackQueueTest {

    private PlaybackQueue<String> queue;

    @BeforeEach
    void setUp() {
        queue = new PlaybackQueue<>();
    }

    @Test
    @DisplayName("Should enqueue and dequeue in strict FIFO order")
    void testFifoOrdering() {
        queue.enqueue("Track 1");
        queue.enqueue("Track 2");
        queue.enqueue("Track 3");

        assertEquals(3, queue.size());
        assertEquals("Track 1", queue.peek());
        assertEquals("Track 1", queue.dequeue());
        assertEquals("Track 2", queue.dequeue());
        assertEquals("Track 3", queue.dequeue());
        assertTrue(queue.isEmpty());
    }

    @Test
    @DisplayName("Should throw NoSuchElementException when dequeuing from empty queue")
    void testDequeueEmpty() {
        assertTrue(queue.isEmpty());
        assertThrows(NoSuchElementException.class, () -> queue.dequeue());
    }

    @Test
    @DisplayName("Should return null on peek when queue is empty")
    void testPeekEmpty() {
        assertNull(queue.peek());
    }

    @Test
    @DisplayName("Should reject null items on enqueue")
    void testRejectNull() {
        assertThrows(IllegalArgumentException.class, () -> queue.enqueue(null));
    }

    @Test
    @DisplayName("Should remove target item by ID predicate")
    void testRemoveById() {
        queue.enqueue("alpha");
        queue.enqueue("beta");
        queue.enqueue("gamma");

        boolean removed = queue.removeById(s -> s, "beta");
        assertTrue(removed);
        assertEquals(2, queue.size());

        List<String> list = queue.toList();
        assertEquals(List.of("alpha", "gamma"), list);
    }

    @Test
    @DisplayName("Should reorder items in queue")
    void testReorder() {
        queue.enqueue("A");
        queue.enqueue("B");
        queue.enqueue("C");

        boolean reordered = queue.reorder(2, 0); // Move "C" to index 0
        assertTrue(reordered);

        List<String> list = queue.toList();
        assertEquals(List.of("C", "A", "B"), list);
    }

    @Test
    @DisplayName("Should maintain consistency under concurrent multi-threaded operations")
    void testConcurrentEnqueueAndDequeue() throws InterruptedException {
        int threadCount = 10;
        int operationsPerThread = 100;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        for (int t = 0; t < threadCount; t++) {
            final int threadId = t;
            executor.submit(() -> {
                try {
                    startLatch.await();
                    for (int i = 0; i < operationsPerThread; i++) {
                        queue.enqueue("T" + threadId + "-" + i);
                    }
                } catch (Exception ignored) {
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        boolean completed = doneLatch.await(5, TimeUnit.SECONDS);
        assertTrue(completed, "Concurrent enqueue should complete within timeout");
        executor.shutdown();

        assertEquals(threadCount * operationsPerThread, queue.size());
        assertEquals(threadCount * operationsPerThread, queue.toList().size());

        // Dequeue half of the items concurrently
        ExecutorService dequeueExecutor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch dequeueStartLatch = new CountDownLatch(1);
        CountDownLatch dequeueDoneLatch = new CountDownLatch(threadCount);
        List<String> dequeuedItems = Collections.synchronizedList(new ArrayList<>());

        int dequeuesPerThread = operationsPerThread / 2;
        for (int t = 0; t < threadCount; t++) {
            dequeueExecutor.submit(() -> {
                try {
                    dequeueStartLatch.await();
                    for (int i = 0; i < dequeuesPerThread; i++) {
                        String item = queue.dequeue();
                        if (item != null) dequeuedItems.add(item);
                    }
                } catch (Exception ignored) {
                } finally {
                    dequeueDoneLatch.countDown();
                }
            });
        }

        dequeueStartLatch.countDown();
        boolean dequeueCompleted = dequeueDoneLatch.await(5, TimeUnit.SECONDS);
        assertTrue(dequeueCompleted, "Concurrent dequeue should complete within timeout");
        dequeueExecutor.shutdown();

        int expectedRemaining = (threadCount * operationsPerThread) - (threadCount * dequeuesPerThread);
        assertEquals(expectedRemaining, queue.size());
        assertEquals(threadCount * dequeuesPerThread, dequeuedItems.size());
    }
}

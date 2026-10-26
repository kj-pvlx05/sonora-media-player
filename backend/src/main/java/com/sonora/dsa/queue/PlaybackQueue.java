package com.sonora.dsa.queue;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.function.Function;

/**
 * Custom First-In, First-Out (FIFO) Queue implementation for SONORA Playback Management.
 * Implemented from first principles using dynamic linear nodes.
 *
 * Time Complexities:
 * - enqueue: O(1)
 * - dequeue: O(1)
 * - peek:    O(1)
 * - size:    O(1)
 *
 * @param <T> Element type stored in the queue
 */
public class PlaybackQueue<T> {
    private QueueNode<T> front;
    private QueueNode<T> rear;
    private int size;

    public PlaybackQueue() {
        this.front = null;
        this.rear = null;
        this.size = 0;
    }

    /**
     * Enqueues an item at the rear of the queue (FIFO policy).
     * O(1) time complexity.
     *
     * @param item element to enqueue
     */
    public synchronized void enqueue(T item) {
        if (item == null) {
            throw new IllegalArgumentException("Cannot enqueue null item into PlaybackQueue");
        }

        QueueNode<T> newNode = new QueueNode<>(item);
        if (isEmpty()) {
            front = newNode;
            rear = newNode;
        } else {
            rear.setNext(newNode);
            rear = newNode;
        }
        size++;
    }

    /**
     * Dequeues and returns the front item of the queue (FIFO policy).
     * O(1) time complexity.
     *
     * @return the dequeued item
     * @throws NoSuchElementException if queue is empty
     */
    public synchronized T dequeue() {
        if (isEmpty()) {
            throw new NoSuchElementException("PlaybackQueue is empty: cannot dequeue");
        }

        T data = front.getData();
        front = front.getNext();
        if (front == null) {
            rear = null;
        }
        size--;
        return data;
    }

    /**
     * Inspects the front item without removing it.
     * O(1) time complexity.
     *
     * @return the front item or null if empty
     */
    public synchronized T peek() {
        return isEmpty() ? null : front.getData();
    }

    /**
     * Checks if the queue is currently empty.
     */
    public synchronized boolean isEmpty() {
        return size == 0;
    }

    /**
     * Returns the current number of elements in the queue.
     */
    public synchronized int size() {
        return size;
    }

    /**
     * Clears all elements from the queue.
     */
    public synchronized void clear() {
        front = null;
        rear = null;
        size = 0;
    }

    /**
     * Removes an item matching the provided identifier extractor.
     *
     * @param idExtractor function to extract unique id from element
     * @param id          target id to remove
     * @return true if an item was removed, false otherwise
     */
    public synchronized boolean removeById(Function<T, String> idExtractor, String id) {
        if (isEmpty() || id == null) {
            return false;
        }

        // Case 1: Target is at front
        if (id.equals(idExtractor.apply(front.getData()))) {
            dequeue();
            return true;
        }

        // Case 2: Target is in the middle or rear
        QueueNode<T> current = front;
        while (current.getNext() != null) {
            if (id.equals(idExtractor.apply(current.getNext().getData()))) {
                QueueNode<T> nodeToRemove = current.getNext();
                current.setNext(nodeToRemove.getNext());

                // If removing rear, update rear pointer
                if (nodeToRemove == rear) {
                    rear = current;
                }
                size--;
                return true;
            }
            current = current.getNext();
        }

        return false;
    }

    /**
     * Reorders an element from one index to another (user drag modification of FIFO order).
     *
     * @param fromIndex zero-based source index
     * @param toIndex   zero-based target index
     * @return true if reordered successfully
     */
    public synchronized boolean reorder(int fromIndex, int toIndex) {
        if (fromIndex < 0 || fromIndex >= size || toIndex < 0 || toIndex >= size || fromIndex == toIndex) {
            return false;
        }

        List<T> list = toList();
        T movedItem = list.remove(fromIndex);
        list.add(toIndex, movedItem);

        // Reconstruct queue
        clear();
        for (T item : list) {
            enqueue(item);
        }
        return true;
    }

    /**
     * Returns an immutable snapshot list of all items in strict FIFO order.
     */
    public synchronized List<T> toList() {
        List<T> items = new ArrayList<>(size);
        QueueNode<T> current = front;
        while (current != null) {
            items.add(current.getData());
            current = current.getNext();
        }
        return items;
    }
}

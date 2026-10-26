package com.sonora.dsa.queue;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.function.Function;

/**
 * Custom First-In, First-Out (FIFO) Queue implementation for SONORA Playback Management.
 * Implemented using dynamic singly linked nodes (QueueNode).
 *
 * Operations and Time Complexities:
 * - enqueue(item):   O(1)
 * - dequeue():       O(1)
 * - peek():          O(1)
 * - isEmpty():       O(1)
 * - size():          O(1)
 * - clear():         O(1)
 * - removeById():    O(n) search + O(1) unlinking
 * - reorder():       O(n)
 * - toList():        O(n)
 *
 * @param <T> Type of elements stored in the queue
 */
public class PlaybackQueue<T> {

    // Points to the front (first element) of the queue
    private QueueNode<T> front;

    // Points to the rear (last element) of the queue
    private QueueNode<T> rear;

    // Total number of elements currently in the queue
    private int size;

    /**
     * Initializes an empty playback queue.
     */
    public PlaybackQueue() {
        this.front = null;
        this.rear = null;
        this.size = 0;
    }

    /**
     * Inserts an element at the end of the queue (FIFO policy).
     * Time Complexity: O(1) because we maintain a direct rear pointer.
     *
     * @param item the element to add (cannot be null)
     */
    public synchronized void enqueue(T item) {
        if (item == null) {
            throw new IllegalArgumentException("Cannot enqueue null item into PlaybackQueue");
        }

        QueueNode<T> newNode = new QueueNode<>(item);

        // If the queue is empty, the new node becomes both front and rear
        if (isEmpty()) {
            front = newNode;
            rear = newNode;
        } else {
            // Link the new node after the current rear and update rear
            rear.setNext(newNode);
            rear = newNode;
        }
        size++;
    }

    /**
     * Removes and returns the element at the front of the queue (FIFO policy).
     * Time Complexity: O(1) because we remove directly from the front pointer.
     *
     * @return the dequeued element
     * @throws NoSuchElementException if the queue is empty
     */
    public synchronized T dequeue() {
        if (isEmpty()) {
            throw new NoSuchElementException("PlaybackQueue is empty: cannot dequeue");
        }

        T removedData = front.getData();

        // Move the front pointer to the next node
        front = front.getNext();

        // If the queue becomes empty after removing, reset rear to null
        if (front == null) {
            rear = null;
        }

        size--;
        return removedData;
    }

    /**
     * Retrieves the element at the front without removing it.
     * Time Complexity: O(1).
     *
     * @return the front element, or null if the queue is empty
     */
    public synchronized T peek() {
        if (isEmpty()) {
            return null;
        }
        return front.getData();
    }

    /**
     * Checks if the queue has no elements.
     * Time Complexity: O(1).
     */
    public synchronized boolean isEmpty() {
        return size == 0;
    }

    /**
     * Returns the total count of elements currently in the queue.
     * Time Complexity: O(1).
     */
    public synchronized int size() {
        return size;
    }

    /**
     * Removes all elements from the queue.
     * Time Complexity: O(1).
     */
    public synchronized void clear() {
        front = null;
        rear = null;
        size = 0;
    }

    /**
     * Removes a specific item matching the given ID from anywhere in the queue.
     * Used when a user cancels or removes an upcoming track from the playlist queue.
     *
     * Time Complexity: O(n) search + O(1) unlinking.
     *
     * @param idExtractor function to extract the unique ID string from element T
     * @param id          the target ID to search for
     * @return true if an item was found and removed, false otherwise
     */
    public synchronized boolean removeById(Function<T, String> idExtractor, String id) {
        if (isEmpty() || idExtractor == null || id == null) {
            return false;
        }

        // Case 1: Target element is at the front of the queue
        String frontId = idExtractor.apply(front.getData());
        if (id.equals(frontId)) {
            dequeue();
            return true;
        }

        // Case 2: Target element is in the middle or at the rear
        // We traverse using 'current' as the predecessor node
        QueueNode<T> current = front;
        while (current.getNext() != null) {
            String nextId = idExtractor.apply(current.getNext().getData());
            if (id.equals(nextId)) {
                QueueNode<T> nodeToRemove = current.getNext();

                // Unlink nodeToRemove by skipping over it
                current.setNext(nodeToRemove.getNext());

                // If we removed the rear node, update rear to the predecessor
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
     * Moves an element from a source index to a destination index.
     * Used when a user drags and reorders a track in the playback queue.
     *
     * Time Complexity: O(n).
     *
     * @param fromIndex zero-based source position
     * @param toIndex   zero-based destination position
     * @return true if the queue was successfully reordered, false if indices are invalid
     */
    public synchronized boolean reorder(int fromIndex, int toIndex) {
        // Validate index bounds
        if (fromIndex < 0 || fromIndex >= size || toIndex < 0 || toIndex >= size || fromIndex == toIndex) {
            return false;
        }

        // 1. Copy queue elements into a temporary list
        List<T> list = toList();

        // 2. Reposition the selected element in the list
        T movedItem = list.remove(fromIndex);
        list.add(toIndex, movedItem);

        // 3. Clear and re-populate the queue in the updated order
        clear();
        for (T item : list) {
            enqueue(item);
        }

        return true;
    }

    /**
     * Returns a new List containing all queue elements in FIFO order (front to rear).
     * Time Complexity: O(n).
     *
     * @return a List of elements currently in the queue
     */
    public synchronized List<T> toList() {
        List<T> items = new ArrayList<>();
        QueueNode<T> current = front;
        while (current != null) {
            items.add(current.getData());
            current = current.getNext();
        }
        return items;
    }
}

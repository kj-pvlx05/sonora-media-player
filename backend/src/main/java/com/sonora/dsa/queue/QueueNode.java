package com.sonora.dsa.queue;

/**
 * Node class for the custom PlaybackQueue.
 * Represents a single element in a singly linked FIFO queue.
 *
 * @param <T> Type of data stored in this node
 */
public class QueueNode<T> {

    // Data stored in the node
    private T data;

    // Reference to the next node in the queue
    private QueueNode<T> next;

    /**
     * Constructor to create a new queue node with the given data.
     * The next pointer is initialized to null.
     */
    public QueueNode(T data) {
        this.data = data;
        this.next = null;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public QueueNode<T> getNext() {
        return next;
    }

    public void setNext(QueueNode<T> next) {
        this.next = next;
    }
}

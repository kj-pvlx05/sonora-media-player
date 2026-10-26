package com.sonora.dsa.list;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

/**
 * Custom Doubly Linked List implementation for SONORA Playlist & Album Navigation.
 * Implemented from first principles with bidirectional pointers (prev / next) and
 * an active playback cursor node.
 *
 * Time Complexities:
 * - addLast / addFirst: O(1)
 * - next / previous:    O(1)
 * - get / search:       O(N)
 * - remove:             O(N) search + O(1) unlinking
 *
 * @param <T> Element type stored in the list
 */
public class MediaLinkedList<T> {
    private ListNode<T> head;
    private ListNode<T> tail;
    private ListNode<T> current;
    private int size;

    public MediaLinkedList() {
        this.head = null;
        this.tail = null;
        this.current = null;
        this.size = 0;
    }

    /**
     * Appends an element to the end (tail) of the doubly linked list.
     * O(1) time complexity.
     *
     * @param item element to append
     */
    public synchronized void addLast(T item) {
        if (item == null) {
            throw new IllegalArgumentException("Cannot add null item to MediaLinkedList");
        }

        ListNode<T> newNode = new ListNode<>(item);
        if (isEmpty()) {
            head = newNode;
            tail = newNode;
            current = newNode;
        } else {
            tail.setNext(newNode);
            newNode.setPrev(tail);
            tail = newNode;
        }
        size++;
    }

    /**
     * Prepends an element to the front (head) of the doubly linked list.
     * O(1) time complexity.
     *
     * @param item element to prepend
     */
    public synchronized void addFirst(T item) {
        if (item == null) {
            throw new IllegalArgumentException("Cannot add null item to MediaLinkedList");
        }

        ListNode<T> newNode = new ListNode<>(item);
        if (isEmpty()) {
            head = newNode;
            tail = newNode;
            current = newNode;
        } else {
            newNode.setNext(head);
            head.setPrev(newNode);
            head = newNode;
        }
        size++;
    }

    /**
     * Advances the active cursor to the next node in the playlist.
     * O(1) time complexity.
     *
     * @param loopIfEnd if true, wraps around to head when reaching tail
     * @return the data at the next node, or null if at tail and loopIfEnd is false
     */
    public synchronized T next(boolean loopIfEnd) {
        if (isEmpty()) return null;

        if (current == null) {
            current = head;
            return current.getData();
        }

        if (current.getNext() != null) {
            current = current.getNext();
            return current.getData();
        } else if (loopIfEnd) {
            current = head;
            return current.getData();
        }

        return null;
    }

    /**
     * Moves the active cursor to the previous node in the playlist.
     * O(1) time complexity.
     *
     * @param loopIfStart if true, wraps around to tail when reaching head
     * @return the data at the previous node, or null if at head and loopIfStart is false
     */
    public synchronized T previous(boolean loopIfStart) {
        if (isEmpty()) return null;

        if (current == null) {
            current = tail;
            return current.getData();
        }

        if (current.getPrev() != null) {
            current = current.getPrev();
            return current.getData();
        } else if (loopIfStart) {
            current = tail;
            return current.getData();
        }

        return null;
    }

    /**
     * Returns the data currently referenced by the active playback cursor.
     */
    public synchronized T getCurrent() {
        return (current != null) ? current.getData() : null;
    }

    /**
     * Sets the active playback cursor to the node matching the provided ID.
     *
     * @param idExtractor function to extract unique id
     * @param id          target id
     * @return true if found and cursor updated
     */
    public synchronized boolean setCurrentById(Function<T, String> idExtractor, String id) {
        if (isEmpty() || id == null) return false;

        ListNode<T> node = head;
        while (node != null) {
            if (id.equals(idExtractor.apply(node.getData()))) {
                current = node;
                return true;
            }
            node = node.getNext();
        }
        return false;
    }

    /**
     * Removes an item by identifier.
     *
     * @param idExtractor function to extract unique id
     * @param id          target id
     * @return true if item was found and unlinked
     */
    public synchronized boolean removeById(Function<T, String> idExtractor, String id) {
        if (isEmpty() || id == null) return false;

        ListNode<T> node = head;
        while (node != null) {
            if (id.equals(idExtractor.apply(node.getData()))) {
                // Adjust cursor if pointing to deleted node
                if (current == node) {
                    current = (node.getNext() != null) ? node.getNext() : node.getPrev();
                }

                // Unlink node
                if (node.getPrev() != null) {
                    node.getPrev().setNext(node.getNext());
                } else {
                    head = node.getNext();
                }

                if (node.getNext() != null) {
                    node.getNext().setPrev(node.getPrev());
                } else {
                    tail = node.getPrev();
                }

                size--;
                return true;
            }
            node = node.getNext();
        }

        return false;
    }

    /**
     * Returns the element at the specified index.
     */
    public synchronized T get(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
        }

        // Optimize search from head or tail depending on index proximity
        ListNode<T> node;
        if (index < size / 2) {
            node = head;
            for (int i = 0; i < index; i++) {
                node = node.getNext();
            }
        } else {
            node = tail;
            for (int i = size - 1; i > index; i--) {
                node = node.getPrev();
            }
        }
        return node.getData();
    }

    /**
     * Returns the number of elements in the list.
     */
    public synchronized int size() {
        return size;
    }

    /**
     * Checks if the list is empty.
     */
    public synchronized boolean isEmpty() {
        return size == 0;
    }

    /**
     * Clears all elements from the list.
     */
    public synchronized void clear() {
        head = null;
        tail = null;
        current = null;
        size = 0;
    }

    /**
     * Returns a snapshot List<T> of all elements in forward order.
     */
    public synchronized List<T> toList() {
        List<T> items = new ArrayList<>(size);
        ListNode<T> node = head;
        while (node != null) {
            items.add(node.getData());
            node = node.getNext();
        }
        return items;
    }
}

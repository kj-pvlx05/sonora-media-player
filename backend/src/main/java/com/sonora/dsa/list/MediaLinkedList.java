package com.sonora.dsa.list;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

/**
 * Custom Doubly Linked List implementation for SONORA Playlist & Album Navigation.
 * Implemented using bidirectional nodes (ListNode) with head, tail, and current playback cursor.
 *
 * Operations and Time Complexities:
 * - addLast(item) / addFirst(item): O(1)
 * - next(loop) / previous(loop):    O(1)
 * - getCurrent():                   O(1)
 * - size() / isEmpty() / clear():   O(1)
 * - get(index):                     O(n)
 * - setCurrentById(id):             O(n)
 * - removeById(id):                 O(n) search + O(1) unlinking
 * - toList():                       O(n)
 *
 * @param <T> Type of elements stored in the list
 */
public class MediaLinkedList<T> {

    // Points to the first node in the list
    private ListNode<T> head;

    // Points to the last node in the list
    private ListNode<T> tail;

    // Active playback cursor pointing to the currently playing track
    private ListNode<T> current;

    // Total number of elements in the list
    private int size;

    /**
     * Initializes an empty doubly linked list.
     */
    public MediaLinkedList() {
        this.head = null;
        this.tail = null;
        this.current = null;
        this.size = 0;
    }

    /**
     * Appends an element to the end (tail) of the doubly linked list.
     * Time Complexity: O(1) because we maintain a tail pointer.
     *
     * @param item element to append (cannot be null)
     */
    public synchronized void addLast(T item) {
        if (item == null) {
            throw new IllegalArgumentException("Cannot add null item to MediaLinkedList");
        }

        ListNode<T> newNode = new ListNode<>(item);

        if (isEmpty()) {
            head = newNode;
            tail = newNode;
            current = newNode; // Initial track becomes current
        } else {
            tail.setNext(newNode);
            newNode.setPrev(tail);
            tail = newNode;
        }
        size++;
    }

    /**
     * Prepends an element to the front (head) of the doubly linked list.
     * Time Complexity: O(1) because we maintain a head pointer.
     *
     * @param item element to prepend (cannot be null)
     */
    public synchronized void addFirst(T item) {
        if (item == null) {
            throw new IllegalArgumentException("Cannot add null item to MediaLinkedList");
        }

        ListNode<T> newNode = new ListNode<>(item);

        if (isEmpty()) {
            head = newNode;
            tail = newNode;
            current = newNode; // Initial track becomes current
        } else {
            newNode.setNext(head);
            head.setPrev(newNode);
            head = newNode;
        }
        size++;
    }

    /**
     * Advances the active cursor to the next node in the playlist.
     * Time Complexity: O(1).
     *
     * @param loopIfEnd if true, wraps around to head when reaching the end of the playlist
     * @return the data at the next node, or null if at tail and loopIfEnd is false
     */
    public synchronized T next(boolean loopIfEnd) {
        if (isEmpty()) {
            return null;
        }

        // If cursor was unassigned, start at head
        if (current == null) {
            current = head;
            return current.getData();
        }

        // Move to next node if available
        if (current.getNext() != null) {
            current = current.getNext();
            return current.getData();
        } else if (loopIfEnd) {
            // Loop enabled: wrap around to head
            current = head;
            return current.getData();
        }

        // Reached end and repeat is disabled
        return null;
    }

    /**
     * Moves the active cursor to the previous node in the playlist.
     * Time Complexity: O(1).
     *
     * @param loopIfStart if true, wraps around to tail when reaching the start of the playlist
     * @return the data at the previous node, or null if at head and loopIfStart is false
     */
    public synchronized T previous(boolean loopIfStart) {
        if (isEmpty()) {
            return null;
        }

        // If cursor was unassigned, start at tail
        if (current == null) {
            current = tail;
            return current.getData();
        }

        // Move to previous node if available
        if (current.getPrev() != null) {
            current = current.getPrev();
            return current.getData();
        } else if (loopIfStart) {
            // Loop enabled: wrap around to tail
            current = tail;
            return current.getData();
        }

        // Reached start and repeat is disabled
        return null;
    }

    /**
     * Returns the data currently referenced by the active playback cursor.
     * Time Complexity: O(1).
     *
     * @return data of the current track, or null if list is empty or cursor unset
     */
    public synchronized T getCurrent() {
        if (current != null) {
            return current.getData();
        }
        return null;
    }

    /**
     * Sets the active playback cursor to the node matching the provided ID.
     * Used when a user clicks a track in the playlist library.
     *
     * Time Complexity: O(n) linear search from head.
     *
     * @param idExtractor function to extract unique ID string from element T
     * @param id          target ID to find
     * @return true if track was found and cursor updated, false otherwise
     */
    public synchronized boolean setCurrentById(Function<T, String> idExtractor, String id) {
        if (isEmpty() || idExtractor == null || id == null) {
            return false;
        }

        ListNode<T> temp = head;
        while (temp != null) {
            String currentId = idExtractor.apply(temp.getData());
            if (id.equals(currentId)) {
                current = temp;
                return true;
            }
            temp = temp.getNext();
        }

        return false;
    }

    /**
     * Removes an item matching the provided ID and unlinks its node.
     * Time Complexity: O(n) search + O(1) unlinking.
     *
     * @param idExtractor function to extract unique ID string from element T
     * @param id          target ID to remove
     * @return true if item was found and removed, false otherwise
     */
    public synchronized boolean removeById(Function<T, String> idExtractor, String id) {
        if (isEmpty() || idExtractor == null || id == null) {
            return false;
        }

        ListNode<T> temp = head;
        while (temp != null) {
            String currentId = idExtractor.apply(temp.getData());
            if (id.equals(currentId)) {

                // 1. Adjust playback cursor if pointing to the node being deleted
                if (current == temp) {
                    if (temp.getNext() != null) {
                        current = temp.getNext();
                    } else {
                        current = temp.getPrev();
                    }
                }

                // 2. Unlink from the predecessor node
                if (temp.getPrev() != null) {
                    temp.getPrev().setNext(temp.getNext());
                } else {
                    head = temp.getNext(); // temp was head
                }

                // 3. Unlink from the successor node
                if (temp.getNext() != null) {
                    temp.getNext().setPrev(temp.getPrev());
                } else {
                    tail = temp.getPrev(); // temp was tail
                }

                size--;
                return true;
            }
            temp = temp.getNext();
        }

        return false;
    }

    /**
     * Returns the element at the specified zero-based index.
     * Traversal is optimized: starts from head if index is in first half, or from tail if in second half.
     *
     * Time Complexity: O(n).
     *
     * @param index position to retrieve (0 to size - 1)
     * @return element at the given index
     * @throws IndexOutOfBoundsException if index is negative or >= size
     */
    public synchronized T get(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
        }

        ListNode<T> temp;
        // Optimize search direction: head-first or tail-first
        if (index < size / 2) {
            temp = head;
            for (int i = 0; i < index; i++) {
                temp = temp.getNext();
            }
        } else {
            temp = tail;
            for (int i = size - 1; i > index; i--) {
                temp = temp.getPrev();
            }
        }
        return temp.getData();
    }

    /**
     * Returns the number of elements in the list.
     * Time Complexity: O(1).
     */
    public synchronized int size() {
        return size;
    }

    /**
     * Checks if the list has zero elements.
     * Time Complexity: O(1).
     */
    public synchronized boolean isEmpty() {
        return size == 0;
    }

    /**
     * Clears all elements and resets all pointers.
     * Time Complexity: O(1).
     */
    public synchronized void clear() {
        head = null;
        tail = null;
        current = null;
        size = 0;
    }

    /**
     * Returns a new List of all elements in forward order from head to tail.
     * Time Complexity: O(n).
     *
     * @return a List containing all elements in sequence
     */
    public synchronized List<T> toList() {
        List<T> items = new ArrayList<>();
        ListNode<T> temp = head;
        while (temp != null) {
            items.add(temp.getData());
            temp = temp.getNext();
        }
        return items;
    }
}

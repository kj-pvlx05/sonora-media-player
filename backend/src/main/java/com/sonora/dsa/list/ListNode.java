package com.sonora.dsa.list;

/**
 * Node class for the custom Doubly Linked List (MediaLinkedList).
 * Stores data and maintains bidirectional links (prev and next) to adjacent nodes.
 *
 * @param <T> Type of data stored in this node
 */
public class ListNode<T> {

    // Data payload stored in this node
    private T data;

    // Pointer to the previous node in the list
    private ListNode<T> prev;

    // Pointer to the next node in the list
    private ListNode<T> next;

    /**
     * Constructor to create a new doubly linked list node.
     * Both prev and next pointers are initialized to null.
     */
    public ListNode(T data) {
        this.data = data;
        this.prev = null;
        this.next = null;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public ListNode<T> getPrev() {
        return prev;
    }

    public void setPrev(ListNode<T> prev) {
        this.prev = prev;
    }

    public ListNode<T> getNext() {
        return next;
    }

    public void setNext(ListNode<T> next) {
        this.next = next;
    }
}

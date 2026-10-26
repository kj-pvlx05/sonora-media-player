package com.sonora.dsa.list;

/**
 * Node representation for the custom Doubly Linked List (MediaLinkedList).
 * Maintains bidirectional references (prev and next) to adjacent nodes.
 *
 * @param <T> data payload type
 */
public class ListNode<T> {
    private T data;
    private ListNode<T> prev;
    private ListNode<T> next;

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

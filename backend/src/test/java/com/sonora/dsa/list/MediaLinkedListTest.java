package com.sonora.dsa.list;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("MediaLinkedList Doubly Linked List Invariant & Data Structure Tests")
class MediaLinkedListTest {

    private MediaLinkedList<String> list;

    @BeforeEach
    void setUp() {
        list = new MediaLinkedList<>();
    }

    @Test
    @DisplayName("Should add elements to end and preserve bidirectional sequence")
    void testAddLastAndToList() {
        list.addLast("Track A");
        list.addLast("Track B");
        list.addLast("Track C");

        assertEquals(3, list.size());
        assertEquals(List.of("Track A", "Track B", "Track C"), list.toList());
        assertEquals("Track A", list.getCurrent());
    }

    @Test
    @DisplayName("Should add elements to front using addFirst()")
    void testAddFirst() {
        list.addFirst("Track C");
        list.addFirst("Track B");
        list.addFirst("Track A");

        assertEquals(3, list.size());
        assertEquals(List.of("Track A", "Track B", "Track C"), list.toList());
        assertEquals("Track C", list.getCurrent()); // First added became initial current
    }

    @Test
    @DisplayName("Should navigate bidirectionally using next() and previous()")
    void testBidirectionalNavigation() {
        list.addLast("First");
        list.addLast("Second");
        list.addLast("Third");

        // Forward traversal
        assertEquals("First", list.getCurrent());
        assertEquals("Second", list.next(false));
        assertEquals("Third", list.next(false));
        assertNull(list.next(false)); // Reached end without loop

        // Loop forward (wraps to head)
        assertEquals("First", list.next(true));

        // Backward traversal (wraps to tail when at head)
        assertEquals("Third", list.previous(true));
        assertEquals("Second", list.previous(false));
        assertEquals("First", list.previous(false));
        assertNull(list.previous(false)); // Reached head without loop
    }

    @Test
    @DisplayName("Should set current cursor by identifier")
    void testSetCurrentById() {
        list.addLast("ID-1");
        list.addLast("ID-2");
        list.addLast("ID-3");

        boolean found = list.setCurrentById(s -> s, "ID-2");
        assertTrue(found);
        assertEquals("ID-2", list.getCurrent());

        boolean notFound = list.setCurrentById(s -> s, "NON-EXISTENT");
        assertFalse(notFound);
        assertEquals("ID-2", list.getCurrent()); // Remains unchanged
    }

    @Test
    @DisplayName("Should unlink middle node and maintain valid prev/next pointers")
    void testRemoveMiddleNode() {
        list.addLast("A");
        list.addLast("B");
        list.addLast("C");

        boolean removed = list.removeById(s -> s, "B");
        assertTrue(removed);
        assertEquals(2, list.size());
        assertEquals(List.of("A", "C"), list.toList());

        // Test forward navigation past deleted node
        list.setCurrentById(s -> s, "A");
        assertEquals("C", list.next(false));
    }

    @Test
    @DisplayName("Should remove first node (head) correctly and update pointers")
    void testRemoveFirstNode() {
        list.addLast("A");
        list.addLast("B");
        list.addLast("C");

        boolean removed = list.removeById(s -> s, "A");
        assertTrue(removed);
        assertEquals(2, list.size());
        assertEquals(List.of("B", "C"), list.toList());

        // Ensure cursor updated to next node B and previous of B is null
        assertEquals("B", list.getCurrent());
        assertEquals("C", list.next(false));
        assertEquals("B", list.previous(false));
        assertNull(list.previous(false)); // Head prev must be null
    }

    @Test
    @DisplayName("Should remove last node (tail) correctly and update pointers")
    void testRemoveLastNode() {
        list.addLast("A");
        list.addLast("B");
        list.addLast("C");
        list.setCurrentById(s -> s, "C"); // Cursor at tail

        boolean removed = list.removeById(s -> s, "C");
        assertTrue(removed);
        assertEquals(2, list.size());
        assertEquals(List.of("A", "B"), list.toList());

        // Ensure cursor adjusted to B and B.next is null
        assertEquals("B", list.getCurrent());
        assertNull(list.next(false)); // Tail next must be null
    }

    @Test
    @DisplayName("Should handle single-node transitions safely (add, remove, add again)")
    void testSingleNodeTransitions() {
        list.addLast("Solo");
        assertEquals(1, list.size());
        assertEquals("Solo", list.getCurrent());

        // Removing only node should leave list clean and empty
        boolean removed = list.removeById(s -> s, "Solo");
        assertTrue(removed);
        assertEquals(0, list.size());
        assertTrue(list.isEmpty());
        assertNull(list.getCurrent());
        assertNull(list.next(false));
        assertNull(list.previous(false));

        // Adding to now-empty list should work properly
        list.addLast("Revived");
        assertEquals(1, list.size());
        assertEquals("Revived", list.getCurrent());
        assertEquals(List.of("Revived"), list.toList());
    }

    @Test
    @DisplayName("Should safely handle operations on empty list")
    void testEmptyListSafety() {
        assertTrue(list.isEmpty());
        assertEquals(0, list.size());
        assertNull(list.getCurrent());
        assertNull(list.next(true));
        assertNull(list.previous(true));
        assertFalse(list.removeById(s -> s, "anything"));
        assertFalse(list.setCurrentById(s -> s, "anything"));
        assertThrows(IndexOutOfBoundsException.class, () -> list.get(0));
    }

    @Test
    @DisplayName("Should handle duplicate IDs consistently by targeting first occurrence")
    void testDuplicateIdsHandledConsistently() {
        list.addLast("DUP");
        list.addLast("SECOND");
        list.addLast("DUP");

        assertEquals(3, list.size());

        // Removing by ID should remove the first occurrence
        boolean removed = list.removeById(s -> s, "DUP");
        assertTrue(removed);
        assertEquals(2, list.size());
        assertEquals(List.of("SECOND", "DUP"), list.toList());
    }

    @Test
    @DisplayName("Should verify indexing via get() aligns with head/tail traversal")
    void testIndexAccessInvariants() {
        list.addLast("0");
        list.addLast("1");
        list.addLast("2");
        list.addLast("3");
        list.addLast("4");

        for (int i = 0; i < 5; i++) {
            assertEquals(String.valueOf(i), list.get(i));
        }

        assertThrows(IndexOutOfBoundsException.class, () -> list.get(-1));
        assertThrows(IndexOutOfBoundsException.class, () -> list.get(5));
    }
}

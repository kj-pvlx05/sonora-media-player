# 🎵 SONORA — Media Player & Real-Time DSA Engine

[![Deploy to GitHub Pages](https://github.com/kj-pvlx05/sonora-media-player/actions/workflows/deploy.yml/badge.svg)](https://github.com/kj-pvlx05/sonora-media-player/actions/workflows/deploy.yml)
[![Java 17](https://img.shields.io/badge/Java-17-orange.svg)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Live Web Application**: [https://kj-pvlx05.github.io/sonora-media-player/](https://kj-pvlx05.github.io/sonora-media-player/)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Data Structures & Algorithms (DSA) Engine](#-data-structures--algorithms-dsa-engine)
  - [1. Doubly Linked List (Playlist Navigation)](#1-doubly-linked-list-medialinkedlist--listnode)
  - [2. FIFO Playback Queue (Up Next Queue)](#2-fifo-playback-queue-playbackqueue--queuenode)
  - [3. Algorithmic Time & Space Complexities](#3-algorithmic-time--space-complexities)
- [System Architecture](#-system-architecture)
- [REST API Endpoints](#-rest-api-endpoints)
- [Local Development Setup](#-local-development-setup)
- [Running Unit Tests](#-running-unit-tests)
- [CI/CD & GitHub Pages Deployment](#-cicd--github-pages-deployment)
- [Viva & Academic Defense Guide](#-viva--academic-defense-guide)
- [Tech Stack](#-tech-stack)
- [License](#-license)

---

## 🌟 Overview

**SONORA** is a full-stack media player and educational **Data Structures & Algorithms (DSA × OOP)** project developed for B.Tech Computer Science and Engineering. 

Traditional media players hide their underlying collection mechanisms. SONORA bridges high-fidelity UI design with computer science fundamentals by implementing custom data structures from scratch in Java (Spring Boot) and rendering their internal node pointers (`head`, `tail`, `current`, `front`, `rear`, `prev`, `next`) in real-time as music plays in a Next.js front-end.

---

## ✨ Key Features

- **Bidirectional Playlist Traversal**: Continuous forward/backward track navigation powered by a custom Doubly Linked List.
- **Dynamic FIFO Playback Queue**: "Up Next" queue implemented from first principles with enqueue, dequeue, arbitrary cancellation, and drag reordering.
- **Real-Time Memory Visualizer**: Interactive visualizer inspecting live heap node pointers and sequence state during playback.
- **Retro-Futuristic Glassmorphic UI**: High-end aesthetic with audio waveform display, spinning vinyl record animation, dynamic album art palette extraction, and dark mode.
- **Graceful Offline / Demo Mode**: Full client-side simulation when backend is disconnected, and seamless live synchronization when connected to the Spring Boot REST API.
- **Automated CI/CD**: GitHub Actions pipeline executing Java unit tests and deploying static front-end assets to GitHub Pages.

---

## 🧠 Data Structures & Algorithms (DSA) Engine

Both data structures are implemented **from first principles** without relying on Java's built-in `java.util.LinkedList` or `java.util.Queue`.

### 1. Doubly Linked List (`MediaLinkedList` & `ListNode`)

Used for the main playlist and album navigation.

- **Bidirectional Links**: Each `ListNode<T>` stores `data`, a `prev` pointer, and a `next` pointer.
- **Active Cursor**: A dedicated `current` pointer references the track currently loaded in the player.
- **Instant Skipping**: Moving to `next()` or `previous()` is an $\mathcal{O}(1)$ pointer shift without array index lookups.
- **Wrap-Around Looping**: Supports continuous repeat mode by wrapping from `tail` to `head` (and vice-versa).
- **Optimized Indexing**: `get(index)` inspects whether `index < size / 2` to traverse forward from `head` or backward from `tail`, cutting traversal steps in half on average.

```
       head                                                 tail
         │                                                    │
         ▼                                                    ▼
   ┌───────────┐         ┌───────────┐         ┌───────────┐
   │ ListNode  │ ◄─────► │ ListNode  │ ◄─────► │ ListNode  │
   │ "Track 1" │  prev / │ "Track 2" │  prev / │ "Track 3" │
   └───────────┘  next   └───────────┘  next   └───────────┘
                               ▲
                               │
                            current (Active Track)
```

### 2. FIFO Playback Queue (`PlaybackQueue` & `QueueNode`)

Used for the upcoming "Up Next" playback queue.

- **First-In, First-Out (FIFO)**: Songs are enqueued at the back (`rear`) and dequeued from the front (`front`).
- **Dual Pointers**: Both `front` and `rear` references are maintained so that both `enqueue()` and `dequeue()` execute in strict $\mathcal{O}(1)$ time.
- **Mid-Queue Cancellation**: `removeById()` traverses using a predecessor pointer to unlink and bypass cancelled tracks in $\mathcal{O}(n)$ time.
- **User Reordering**: Allows reordering tracks when dragging upcoming songs in the UI.

```
      front                                          rear
        │                                              │
        ▼                                              ▼
   ┌───────────┐            ┌───────────┐        ┌───────────┐
   │ QueueNode │ ─────────► │ QueueNode │ ─────► │ QueueNode │ ──► null
   │  "Song A" │    next    │  "Song B" │  next  │  "Song C" │
   └───────────┘            └───────────┘        └───────────┘
     [Dequeue]                                     [Enqueue]
```

### 3. Algorithmic Time & Space Complexities

| Data Structure | Operation | Method | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :---: | :---: |
| **Doubly Linked List** | Prepend track | `addFirst(item)` | $\mathcal{O}(1)$ | $\mathcal{O}(1)$ |
| **Doubly Linked List** | Append track | `addLast(item)` | $\mathcal{O}(1)$ | $\mathcal{O}(1)$ |
| **Doubly Linked List** | Next / Previous track | `next(loop)` / `previous(loop)` | $\mathcal{O}(1)$ | $\mathcal{O}(1)$ |
| **Doubly Linked List** | Current track read | `getCurrent()` | $\mathcal{O}(1)$ | $\mathcal{O}(1)$ |
| **Doubly Linked List** | Indexed lookup | `get(index)` | $\mathcal{O}(n)$ | $\mathcal{O}(1)$ |
| **Doubly Linked List** | Remove by ID | `removeById(extractor, id)` | $\mathcal{O}(n)$ search + $\mathcal{O}(1)$ unlink | $\mathcal{O}(1)$ |
| **FIFO Queue** | Enqueue track | `enqueue(item)` | $\mathcal{O}(1)$ | $\mathcal{O}(1)$ |
| **FIFO Queue** | Dequeue track | `dequeue()` | $\mathcal{O}(1)$ | $\mathcal{O}(1)$ |
| **FIFO Queue** | Peek front track | `peek()` | $\mathcal{O}(1)$ | $\mathcal{O}(1)$ |
| **FIFO Queue** | Remove upcoming track | `removeById(extractor, id)` | $\mathcal{O}(n)$ search + $\mathcal{O}(1)$ unlink | $\mathcal{O}(1)$ |
| **FIFO Queue** | Reorder queue | `reorder(from, to)` | $\mathcal{O}(n)$ | $\mathcal{O}(n)$ |

> **Thread Safety Note**: All mutating methods in `PlaybackQueue` and `MediaLinkedList` use Java's `synchronized` keyword, ensuring atomic pointer updates across multi-threaded HTTP servlet requests in Spring Boot.

---

## 🏗️ System Architecture

```
sonora-media-player/
├── .github/workflows/
│   └── deploy.yml              # CI/CD: Java DSA testing & GitHub Pages deployment
│
├── backend/                    # Java 17 + Spring Boot 3.4.2 Engine
│   ├── src/main/java/com/sonora/
│   │   ├── config/             # CORS and MVC configuration
│   │   ├── controller/         # REST Controllers (Queue, Media, Visualizer)
│   │   ├── dsa/
│   │   │   ├── list/           # ListNode.java & MediaLinkedList.java
│   │   │   └── queue/          # QueueNode.java & PlaybackQueue.java
│   │   ├── model/              # DTOs (MediaRecord, QueueItemDto, DsaVisualizerStateDto)
│   │   └── service/            # MediaQueueService (Orchestrates DSA & catalog)
│   └── src/test/java/com/sonora/
│       ├── dsa/list/           # MediaLinkedListTest.java (11 unit tests)
│       └── dsa/queue/          # PlaybackQueueTest.java (9 unit tests)
│
└── sonora/                     # Next.js 16 + React 19 Frontend
    ├── src/
    │   ├── app/                # App Router (layout.tsx, page.tsx, globals.css)
    │   ├── components/
    │   │   ├── player/         # Audio controls, waveform, vinyl, artwork
    │   │   ├── queue/          # Queue panel & playback history
    │   │   ├── library/        # Track cards & audio library
    │   │   ├── visualizer/     # Live Doubly Linked List & Queue visualizer
    │   │   └── theme/          # Dynamic accent provider & theme toggle
    │   ├── hooks/              # useAudioPlayer custom hook
    │   └── lib/                # api-client, mock-data, utils
    ├── public/                 # Static audio (.wav) and album covers (.jpg)
    └── next.config.ts          # Static export & GitHub Pages basePath config
```

---

## 📡 REST API Endpoints

The Spring Boot backend listens on `http://localhost:8080`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/media` | Retrieves all tracks in the catalog |
| `GET` | `/api/media/playlist` | Returns playlist items in Doubly Linked List sequence |
| `GET` | `/api/media/current` | Returns track at the active list cursor |
| `POST` | `/api/media/playlist/next?loop=true` | Advances cursor to next track ($\mathcal{O}(1)$) |
| `POST` | `/api/media/playlist/prev?loop=true` | Moves cursor to previous track ($\mathcal{O}(1)$) |
| `POST` | `/api/media/playlist/select/{id}` | Sets playlist cursor to track with matching ID |
| `GET` | `/api/queue` | Returns current FIFO queue snapshot |
| `POST` | `/api/queue?trackId={id}` | Enqueues a track at the rear ($\mathcal{O}(1)$) |
| `POST` | `/api/queue/dequeue` | Dequeues the front track ($\mathcal{O}(1)$) |
| `GET` | `/api/queue/peek` | Inspects the front track without removing it |
| `DELETE` | `/api/queue/{queueId}` | Removes a specific upcoming track by ID |
| `POST` | `/api/queue/reorder?fromIndex={i}&toIndex={j}` | Reorders queue items |
| `DELETE` | `/api/queue` | Clears all items in the queue |
| `GET` | `/api/dsa/state` | Returns atomic snapshot of all node pointers for visualizer |

---

## 🚀 Local Development Setup

### Prerequisites
- **Java 17+** (OpenJDK Temurin recommended)
- **Node.js 18+** & **npm**

### 1. Run the Spring Boot Backend
```bash
# Navigate to backend directory
cd backend

# On Linux / macOS
./mvnw spring-boot:run

# On Windows (PowerShell / Command Prompt)
.\mvnw.cmd spring-boot:run
```
The backend API server will start at `http://localhost:8080`.

### 2. Run the Next.js Frontend
```bash
# Navigate to frontend directory
cd sonora

# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Unit Tests

The core DSA implementations are validated using JUnit 5 tests covering edge cases (empty structures, single-node transitions, boundary deletions, and multi-threaded concurrency):

```bash
cd backend

# Run the complete DSA unit test suite
.\mvnw.cmd test "-Dtest=MediaLinkedListTest,PlaybackQueueTest"
```

**Test Coverage Summary**:
- `MediaLinkedListTest`: 11 tests covering bidirectional traversal, looping, cursor preservation, head/tail deletions, and indexed lookups.
- `PlaybackQueueTest`: 9 tests covering FIFO ordering, peek, queue emptying, single-element transitions, front/middle/rear removals, reordering, and concurrent thread-safety.

---

## 🌐 CI/CD & GitHub Pages Deployment

The repository includes a GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) that triggers automatically on every push to `main`:

1. **Test Stage**: Checks out the repository, sets up JDK 17, and runs the DSA unit tests.
2. **Build Stage**: Sets up Node.js 20, configures GitHub Pages with `basePath: "/sonora-media-player"`, and executes `npm run build` with static export.
3. **Deploy Stage**: Deploys the static output directly to **GitHub Pages**.

To enable GitHub Pages in your own fork:
1. Navigate to **Settings** > **Pages** in your repository.
2. Under **Build and deployment** > **Source**, choose **GitHub Actions**.

---

## 🎓 Viva & Academic Defense Guide

### Frequently Asked Questions

**Q1: Why use a Doubly Linked List instead of an ArrayList for the playlist?**
> *In an `ArrayList`, deleting or inserting an item in the middle or front requires shifting elements in $\mathcal{O}(n)$ time. In a Doubly Linked List, unlinking a node or inserting at head/tail takes strictly $\mathcal{O}(1)$ time once the reference is known. Furthermore, bidirectional traversal (`next` and `previous`) requires only following `next` or `prev` references in $\mathcal{O}(1)$ time.*

**Q2: Why does the Queue maintain both `front` and `rear` pointers?**
> *If only a `front` pointer was kept, enqueueing an item would require traversing all $n$ nodes from `front` to the end, resulting in $\mathcal{O}(n)$ insertion. Keeping a `rear` pointer allows $\mathcal{O}(1)$ insertion at the back while preserving $\mathcal{O}(1)$ removal at the front.*

**Q3: How are edge cases handled when deleting nodes?**
> *When removing the only remaining node in `PlaybackQueue` or `MediaLinkedList`, pointers are cleanly updated to `null` (`front = null; rear = null;` or `head = null; tail = null; current = null;`). When deleting the node currently pointed to by `current`, the cursor automatically advances to `next` (or falls back to `prev`) to prevent orphan cursor references.*

**Q4: Why are the methods marked `synchronized`?**
> *Spring Boot serves incoming HTTP requests using a thread pool. If two clients simultaneously enqueue, dequeue, or skip tracks, race conditions could corrupt node pointers. Marking mutating methods `synchronized` ensures atomic thread safety.*

---

## 🛠️ Tech Stack

- **Backend**: Java 17, Spring Boot 3.4.2, Maven, JUnit 5
- **Frontend**: Next.js 16.4, React 19, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **DevOps**: GitHub Actions, GitHub Pages

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

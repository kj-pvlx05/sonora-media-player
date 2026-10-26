# 🎵 SONORA — Media Player & DSA Engine

SONORA is a sleek, modern media player integrated with an interactive **Data Structures & Algorithms (DSA)** engine. Built to bridge clean UI design with practical algorithmic data structures, SONORA visualizes underlying playlist and queue data structures in real time as audio plays.

---

## 🌟 Features

- **Intuitive Audio Playback**: Responsive play/pause, seek, volume, track skipping, and track looping.
- **Real-Time DSA Visualizer**:
  - **Doubly Linked List**: Powers bidirectional track navigation (Previous / Next) with $O(1)$ operations and pointer visualization.
  - **Playback Queue**: Implements dynamic FIFO queuing ($O(1)$ enqueue and dequeue) with live head/tail pointer inspection.
  - **History Tracking**: Visual representation of played tracks.
- **Modern Glassmorphic UI**: High-fidelity dark mode interface built with Next.js, React 19, Lucide icons, and Tailwind CSS.
- **RESTful Spring Boot DSA Engine**: Decoupled Java backend managing state, pointer updates, and algorithmic operations.

---

## 🏗️ Architecture

```
Media Player/
├── backend/                  # Java 17 + Spring Boot Backend Engine
│   ├── src/main/java/com/sonora/
│   │   ├── controller/       # REST API endpoints (Queue, Visualizer, Media)
│   │   ├── dsa/              # Custom Data Structure implementations
│   │   │   ├── list/         # Doubly Linked List (ListNode, MediaLinkedList)
│   │   │   └── queue/        # Playback Queue (QueueNode, PlaybackQueue)
│   │   ├── model/            # DTOs and Media Models
│   │   └── service/          # Queue and Player business logic
│   └── pom.xml
│
└── sonora/                   # Next.js Frontend Application
    ├── src/
    │   ├── app/              # Next.js App Router
    │   └── components/       # Player, Queue, Visualizer & Library UI
    ├── public/               # Audio assets and media art
    └── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Java 17+** & **Maven**
- **Node.js 18+** & **npm**

### 2. Backend Setup
```bash
cd backend
./mvnw spring-boot:run
```
The backend API server will start at `http://localhost:8080`.

### 3. Frontend Setup
```bash
cd sonora
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Java 17, Spring Boot 3.4.2, Maven
- **Core DSA**: Doubly Linked List, FIFO Queue, Dynamic Node Linking

---

## 📄 License

This project is licensed under the MIT License.

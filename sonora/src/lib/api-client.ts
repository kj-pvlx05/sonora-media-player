import { Track, QueueItem, HistoryEntry } from "@/types/track";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface DsaNodePointer {
  id: string;
  title: string;
  artist: string;
  hasPrev?: boolean;
  hasNext?: boolean;
  isCurrent?: boolean;
}

export interface DsaVisualizerState {
  queueSize: number;
  queueHead: QueueItem | null;
  queueTail: QueueItem | null;
  queueItems: QueueItem[];
  playlistSize: number;
  currentTrack: Track | null;
  playlistItems: Track[];
  queueStructureType: string;
  listStructureType: string;
}

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  status: number;
  payloadSummary?: string;
}

class SonoraApiClient {
  private isOnline = false;
  private logListeners: ((log: ApiLogEntry) => void)[] = [];
  private connectionListeners: ((online: boolean) => void)[] = [];

  public onLog(listener: (log: ApiLogEntry) => void) {
    this.logListeners.push(listener);
    return () => {
      this.logListeners = this.logListeners.filter((l) => l !== listener);
    };
  }

  public onConnectionChange(listener: (online: boolean) => void) {
    this.connectionListeners.push(listener);
    listener(this.isOnline);
    return () => {
      this.connectionListeners = this.connectionListeners.filter((l) => l !== listener);
    };
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  private setOnline(online: boolean) {
    if (this.isOnline !== online) {
      this.isOnline = online;
      this.connectionListeners.forEach((l) => l(online));
    }
  }

  private notifyLog(entry: ApiLogEntry) {
    this.logListeners.forEach((listener) => listener(entry));
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | null> {
    const url = `${API_BASE}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });

      this.setOnline(true);
      this.notifyLog({
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        method: options.method || "GET",
        endpoint,
        status: response.status,
      });

      if (!response.ok) {
        if (response.status === 204) return null;
        return null;
      }

      if (response.status === 204) return null;
      return (await response.json()) as T;
    } catch {
      this.setOnline(false);
      this.notifyLog({
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        method: options.method || "GET",
        endpoint,
        status: 0,
        payloadSummary: "ERR_CONNECTION_REFUSED",
      });
      return null;
    }
  }

  public async checkHealth(): Promise<boolean> {
    const state = await this.request<DsaVisualizerState>("/dsa/state");
    const isHealthy = state !== null;
    this.setOnline(isHealthy);
    return isHealthy;
  }

  public async getDsaState(): Promise<DsaVisualizerState | null> {
    return this.request<DsaVisualizerState>("/dsa/state");
  }

  public async getMediaCatalog(): Promise<Track[] | null> {
    return this.request<Track[]>("/media");
  }

  public async getQueue(): Promise<QueueItem[] | null> {
    return this.request<QueueItem[]>("/queue");
  }

  public async enqueue(trackId: string): Promise<QueueItem | null> {
    return this.request<QueueItem>(`/queue?trackId=${encodeURIComponent(trackId)}`, {
      method: "POST",
    });
  }

  public async dequeue(): Promise<QueueItem | null> {
    return this.request<QueueItem>("/queue/dequeue", {
      method: "POST",
    });
  }

  public async peek(): Promise<QueueItem | null> {
    return this.request<QueueItem>("/queue/peek", {
      method: "GET",
    });
  }

  public async removeFromQueue(queueId: string): Promise<boolean> {
    const res = await this.request<{ removed: boolean; queueId: string }>(
      `/queue/${encodeURIComponent(queueId)}`,
      { method: "DELETE" }
    );
    return !!res?.removed;
  }

  public async clearQueue(): Promise<boolean> {
    const res = await this.request<{ message: string }>("/queue", {
      method: "DELETE",
    });
    return res !== null;
  }

  public async reorderQueue(fromIndex: number, toIndex: number): Promise<boolean> {
    const res = await this.request<{ reordered: boolean }>(
      `/queue/reorder?fromIndex=${fromIndex}&toIndex=${toIndex}`,
      { method: "POST" }
    );
    return !!res?.reordered;
  }

  public async nextPlaylistTrack(loop = true): Promise<Track | null> {
    return this.request<Track>(`/media/playlist/next?loop=${loop}`, {
      method: "POST",
    });
  }

  public async prevPlaylistTrack(loop = true): Promise<Track | null> {
    return this.request<Track>(`/media/playlist/prev?loop=${loop}`, {
      method: "POST",
    });
  }

  public async selectPlaylistTrack(id: string): Promise<boolean> {
    const res = await this.request<{ id: string; selected: boolean }>(
      `/media/playlist/select/${encodeURIComponent(id)}`,
      { method: "POST" }
    );
    return !!res?.selected;
  }

  public async recordPlaybackHistory(trackId: string): Promise<HistoryEntry | null> {
    return this.request<HistoryEntry>(`/media/history/${encodeURIComponent(trackId)}`, {
      method: "POST",
    });
  }

  public async getPlaybackHistory(): Promise<HistoryEntry[] | null> {
    return this.request<HistoryEntry[]>("/media/history");
  }
}

export const sonoraApi = new SonoraApiClient();

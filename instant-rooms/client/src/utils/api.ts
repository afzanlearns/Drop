import axios from "axios";
import type {
  Room,
  ContentItem,
  VersionSnapshot,
  AccessMode,
  ExpiryOption,
} from "../../../shared/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
});

export const roomApi = {
  create: async (data?: { expiryHours?: ExpiryOption; accessMode?: AccessMode }) => {
    const res = await api.post<{ room: Room }>("/rooms", data ?? {});
    return res.data.room;
  },

  get: async (code: string) => {
    const res = await api.get<{ room: Room }>(`/rooms/${code}`);
    return res.data.room;
  },

  updateAccess: async (code: string, accessMode: AccessMode) => {
    const res = await api.patch<{ room: Room }>(`/rooms/${code}/access`, { accessMode });
    return res.data.room;
  },

  updateExpiry: async (code: string, expiryHours: ExpiryOption) => {
    const res = await api.patch<{ room: Room }>(`/rooms/${code}/expiry`, { expiryHours });
    return res.data.room;
  },

  pin: async (code: string, pinned: boolean) => {
    const res = await api.patch<{ room: Room }>(`/rooms/${code}/pin`, { pinned });
    return res.data.room;
  },

  getHistory: async (code: string) => {
    const res = await api.get<{ snapshots: VersionSnapshot[] }>(`/rooms/${code}/history`);
    return res.data.snapshots;
  },

  restore: async (code: string, snapshotAt: string) => {
    const res = await api.post<{ items: ContentItem[]; total: number }>(
      `/rooms/${code}/restore`,
      { snapshotAt }
    );
    return res.data.items;
  },
};

export const contentApi = {
  addText: async (data: {
    roomCode: string;
    type: "text" | "code";
    content: string;
    title?: string;
    language?: string;
  }) => {
    const res = await api.post<{ item: ContentItem }>("/content/text", data);
    return res.data.item;
  },

  upload: async (file: File, roomCode: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("roomCode", roomCode);
    const res = await api.post<{ item: ContentItem }>("/content/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.item;
  },

  list: async (roomCode: string) => {
    const res = await api.get<{ items: ContentItem[]; total: number }>(
      `/content/${roomCode}`
    );
    return res.data.items;
  },

  delete: async (contentId: string) => {
    await api.delete(`/content/${contentId}`);
  },
};

export const exportApi = {
  zip: async (roomCode: string) => {
    const res = await api.post(`/export/${roomCode}/zip`, {}, { responseType: "blob" });
    downloadBlob(res.data as Blob, `room-${roomCode}.zip`);
  },

  markdown: async (roomCode: string) => {
    const res = await api.post(`/export/${roomCode}/md`, {}, { responseType: "blob" });
    downloadBlob(res.data as Blob, `room-${roomCode}.md`);
  },

  pdf: async (roomCode: string) => {
    const res = await api.post(`/export/${roomCode}/pdf`, {}, { responseType: "blob" });
    downloadBlob(res.data as Blob, `room-${roomCode}.pdf`);
  },
};

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

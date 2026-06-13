import axios from "axios";
import type {
  Room,
  ContentItem,
  VersionSnapshot,
  AccessMode,
  ExpiryOption,
  ItemExpiryOption,
} from "../../../shared/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
});

/** Attach creator token header if one is stored for this room */
function creatorHeaders(roomCode: string): Record<string, string> {
  const token = localStorage.getItem(`creator_${roomCode.toUpperCase()}`);
  return token ? { "X-Creator-Token": token } : {};
}

export const roomApi = {
  create: async (data?: {
    expiryHours?: ExpiryOption;
    accessMode?: AccessMode;
    name?: string;
    customCode?: string;
  }) => {
    const res = await api.post<{ room: Room; creatorToken: string }>("/rooms", data ?? {});
    return res.data;
  },

  checkCode: async (code: string): Promise<boolean> => {
    const res = await api.get<{ exists: boolean }>(`/rooms/${code.toUpperCase()}/exists`);
    return res.data.exists;
  },

  get: async (code: string) => {
    const res = await api.get<{ room: Room }>(`/rooms/${code}`);
    return res.data.room;
  },

  updateName: async (code: string, name: string) => {
    const res = await api.patch<{ room: Room }>(
      `/rooms/${code}/name`,
      { name },
      { headers: creatorHeaders(code) }
    );
    return res.data.room;
  },

  updateAccess: async (code: string, accessMode: AccessMode) => {
    const res = await api.patch<{ room: Room }>(
      `/rooms/${code}/access`,
      { accessMode },
      { headers: creatorHeaders(code) }
    );
    return res.data.room;
  },

  updateExpiry: async (code: string, expiryHours: ExpiryOption) => {
    const res = await api.patch<{ room: Room }>(
      `/rooms/${code}/expiry`,
      { expiryHours },
      { headers: creatorHeaders(code) }
    );
    return res.data.room;
  },

  pin: async (code: string, pinned: boolean) => {
    const res = await api.patch<{ room: Room }>(
      `/rooms/${code}/pin`,
      { pinned },
      { headers: creatorHeaders(code) }
    );
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
    uploaderName?: string;
    itemExpiryHours?: ItemExpiryOption;
    tags?: string[];
    note?: string;
  }) => {
    const res = await api.post<{ item: ContentItem }>("/content/text", data);
    return res.data.item;
  },

  upload: async (
    file: File,
    roomCode: string,
    uploaderName?: string,
    itemExpiryHours?: ItemExpiryOption,
    tags?: string[],
    note?: string
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("roomCode", roomCode);
    if (uploaderName) formData.append("uploaderName", uploaderName);
    if (itemExpiryHours) formData.append("itemExpiryHours", String(itemExpiryHours));
    if (tags && tags.length > 0) formData.append("tags", JSON.stringify(tags));
    if (note) formData.append("note", note);
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

  delete: async (contentId: string, roomCode: string) => {
    await api.delete(`/content/${contentId}`, {
      headers: creatorHeaders(roomCode),
    });
  },

  pin: async (contentId: string, roomCode: string, pinned: boolean) => {
    const res = await api.patch<{ item: ContentItem }>(
      `/content/${contentId}/pin`,
      { pinned },
      { headers: creatorHeaders(roomCode) }
    );
    return res.data.item;
  },

  updateTags: async (contentId: string, roomCode: string, tags: string[]) => {
    const res = await api.patch<{ item: ContentItem }>(
      `/content/${contentId}/tags`,
      { tags },
      { headers: creatorHeaders(roomCode) }
    );
    return res.data.item;
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

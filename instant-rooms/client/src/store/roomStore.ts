import { create } from "zustand";
import type { Room, ContentItem, VersionSnapshot, AccessMode, ExpiryOption, ItemExpiryOption, ViewMode } from "../../../shared/types";
import { roomApi, contentApi } from "../utils/api";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface RoomStore {
  room: Room | null;
  contentItems: ContentItem[];
  history: VersionSnapshot[];
  isLoading: boolean;
  isUploading: boolean;
  toasts: Toast[];
  showHistory: boolean;
  viewMode: ViewMode;

  // Actions
  fetchRoom: (code: string) => Promise<void>;
  fetchContent: (code: string) => Promise<void>;
  fetchHistory: (code: string) => Promise<void>;
  addTextContent: (params: {
    type: "text" | "code";
    content: string;
    title?: string;
    language?: string;
    uploaderName?: string;
    itemExpiryHours?: ItemExpiryOption;
    tags?: string[];
    note?: string;
  }) => Promise<void>;
  uploadFile: (file: File, uploaderName?: string, itemExpiryHours?: ItemExpiryOption, tags?: string[], note?: string) => Promise<void>;
  deleteContent: (contentId: string) => Promise<void>;
  pinContent: (contentId: string, pinned: boolean) => Promise<void>;
  updateTags: (contentId: string, tags: string[]) => Promise<void>;
  updateAccessMode: (mode: AccessMode) => Promise<void>;
  updateExpiry: (hours: ExpiryOption) => Promise<void>;
  pinRoom: (pinned: boolean) => Promise<void>;
  updateRoomName: (name: string) => Promise<void>;
  restoreSnapshot: (snapshotAt: string) => Promise<void>;
  setShowHistory: (show: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  room: null,
  contentItems: [],
  history: [],
  isLoading: false,
  isUploading: false,
  toasts: [],
  showHistory: false,
  viewMode: "list",

  fetchRoom: async (code) => {
    set({ isLoading: true });
    try {
      const room = await roomApi.get(code);
      const savedView = localStorage.getItem(`room_view_${code.toUpperCase()}`);
      set({ 
        room, 
        isLoading: false,
        viewMode: (savedView as ViewMode) || "list"
      });
    } catch {
      set({ isLoading: false });
      get().addToast({ type: "error", message: "Room not found or has expired." });
    }
  },

  fetchContent: async (code) => {
    try {
      const items = await contentApi.list(code);
      set({ contentItems: items });
    } catch {
      get().addToast({ type: "error", message: "Failed to load content." });
    }
  },

  fetchHistory: async (code) => {
    try {
      const snapshots = await roomApi.getHistory(code);
      set({ history: snapshots });
    } catch {
      get().addToast({ type: "error", message: "Failed to load history." });
    }
  },

  addTextContent: async (params) => {
    const room = get().room;
    if (!room) return;
    set({ isUploading: true });
    try {
      const { note, ...rest } = params;
      const item = await contentApi.addText({ roomCode: room.code, ...rest, note });
      set((state) => ({
        contentItems: [...state.contentItems, item],
        isUploading: false,
      }));
      get().addToast({ type: "success", message: "Content added." });
    } catch {
      set({ isUploading: false });
      get().addToast({ type: "error", message: "Failed to add content." });
    }
  },

  uploadFile: async (file, uploaderName, itemExpiryHours, tags, note) => {
    const room = get().room;
    if (!room) return;
    set({ isUploading: true });
    try {
      const item = await contentApi.upload(file, room.code, uploaderName, itemExpiryHours, tags, note);
      set((state) => ({
        contentItems: [...state.contentItems, item],
        isUploading: false,
      }));
      get().addToast({ type: "success", message: `${file.name} uploaded.` });
    } catch {
      set({ isUploading: false });
      get().addToast({ type: "error", message: "Upload failed. Check file size (max 10MB)." });
    }
  },

  deleteContent: async (contentId) => {
    const room = get().room;
    if (!room) return;
    try {
      await contentApi.delete(contentId, room.code);
      set((state) => ({
        contentItems: state.contentItems.filter((i) => i.id !== contentId),
      }));
      get().addToast({ type: "success", message: "Item removed." });
    } catch {
      get().addToast({ type: "error", message: "Failed to delete item." });
    }
  },

  pinContent: async (contentId, pinned) => {
    const room = get().room;
    if (!room) return;
    try {
      const updated = await contentApi.pin(contentId, room.code, pinned);
      set((state) => ({
        contentItems: state.contentItems
          .map((i) => (i.id === contentId ? updated : i))
          .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          }),
      }));
      get().addToast({ type: "success", message: pinned ? "Item pinned." : "Item unpinned." });
    } catch {
      get().addToast({ type: "error", message: "Failed to update pin." });
    }
  },

  updateTags: async (contentId, tags) => {
    const room = get().room;
    if (!room) return;
    try {
      const updated = await contentApi.updateTags(contentId, room.code, tags);
      set((state) => ({
        contentItems: state.contentItems.map((i) => (i.id === contentId ? updated : i)),
      }));
    } catch {
      get().addToast({ type: "error", message: "Failed to update tags." });
    }
  },

  updateAccessMode: async (mode) => {
    const room = get().room;
    if (!room) return;
    try {
      const updated = await roomApi.updateAccess(room.code, mode);
      set({ room: updated });
      get().addToast({ type: "success", message: "Access mode updated." });
    } catch {
      get().addToast({ type: "error", message: "Failed to update access mode." });
    }
  },

  updateExpiry: async (hours) => {
    const room = get().room;
    if (!room) return;
    try {
      const updated = await roomApi.updateExpiry(room.code, hours);
      set({ room: updated });
      get().addToast({ type: "success", message: "Expiry updated." });
    } catch {
      get().addToast({ type: "error", message: "Failed to update expiry." });
    }
  },

  pinRoom: async (pinned) => {
    const room = get().room;
    if (!room) return;
    try {
      const updated = await roomApi.pin(room.code, pinned);
      set({ room: updated });
      get().addToast({
        type: "success",
        message: pinned ? "Room pinned — it will never expire." : "Room unpinned.",
      });
    } catch {
      get().addToast({ type: "error", message: "Failed to update pin status." });
    }
  },

  updateRoomName: async (name) => {
    const room = get().room;
    if (!room) return;
    try {
      const updated = await roomApi.updateName(room.code, name);
      set({ room: updated });
    } catch {
      get().addToast({ type: "error", message: "Failed to update room name." });
    }
  },

  restoreSnapshot: async (snapshotAt) => {
    const room = get().room;
    if (!room) return;
    try {
      const items = await roomApi.restore(room.code, snapshotAt);
      set({ contentItems: items, showHistory: false });
      get().addToast({ type: "success", message: "Room restored to selected state." });
    } catch {
      get().addToast({ type: "error", message: "Failed to restore snapshot." });
    }
  },

  setShowHistory: (show) => set({ showHistory: show }),
  
  setViewMode: (mode) => {
    const room = get().room;
    if (room) {
      localStorage.setItem(`room_view_${room.code.toUpperCase()}`, mode);
    }
    set({ viewMode: mode });
  },

  addToast: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  reset: () =>
    set({ room: null, contentItems: [], history: [], isLoading: false, isUploading: false, viewMode: "list" }),
}));

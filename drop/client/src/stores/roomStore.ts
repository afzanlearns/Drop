/**
 * Room Store
 * Manages room state and items
 */

import { create } from 'zustand';
import type { Room, RoomItem } from '../../../shared/types';

interface RoomState {
  room: Room | null;
  items: RoomItem[];
  isLoading: boolean;
  error: string | null;
  setRoom: (room: Room) => void;
  setItems: (items: RoomItem[]) => void;
  addItem: (item: RoomItem) => void;
  removeItem: (itemId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  items: [],
  isLoading: false,
  error: null,
  setRoom: (room) => set({ room }),
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ room: null, items: [], isLoading: false, error: null }),
}));

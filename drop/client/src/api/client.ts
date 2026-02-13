/**
 * API Client
 * Handles all communication with the backend
 */

import axios from 'axios';
import type {
  Room,
  RoomItem,
  CreateRoomResponse,
  GetRoomResponse,
  CreateItemRequest,
  CreateItemResponse,
} from '../../../shared/types';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const roomApi = {
  /**
   * Create a new room
   */
  async createRoom(): Promise<Room> {
    const { data } = await api.post<CreateRoomResponse>('/rooms');
    return data.room;
  },

  /**
   * Get room details and items
   */
  async getRoom(roomId: string): Promise<{ room: Room; items: RoomItem[] }> {
    const { data } = await api.get<GetRoomResponse>(`/rooms/${roomId}`);
    return data;
  },

  /**
   * Create a text or code item
   */
  async createItem(roomId: string, request: CreateItemRequest): Promise<RoomItem> {
    const { data } = await api.post<CreateItemResponse>(`/rooms/${roomId}/items`, request);
    return data.item;
  },

  /**
   * Upload a file (image or PDF)
   */
  async uploadFile(roomId: string, file: File): Promise<RoomItem> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<CreateItemResponse>(
      `/rooms/${roomId}/items/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data.item;
  },

  /**
   * Delete an item
   */
  async deleteItem(roomId: string, itemId: string): Promise<void> {
    await api.delete(`/rooms/${roomId}/items/${itemId}`);
  },

  /**
   * Delete a room
   */
  async deleteRoom(roomId: string): Promise<void> {
    await api.delete(`/rooms/${roomId}`);
  },

  /**
   * Get export URL for room
   */
  getExportUrl(roomId: string): string {
    return `${API_URL}/api/rooms/${roomId}/export`;
  },
};

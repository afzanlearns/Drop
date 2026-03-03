import { AccessMode, Room } from "../../../shared/types";
import { generateRoomCode } from "../utils/roomCode";

interface RoomEntity extends Room {
  contentIds: string[];
}

const rooms = new Map<string, RoomEntity>();

const EXPIRY_OPTIONS: Record<number, number> = {
  1: 1 * 60 * 60 * 1000,
  24: 24 * 60 * 60 * 1000,
  168: 7 * 24 * 60 * 60 * 1000,
};

export const roomService = {
  createRoom(options: { expiryHours?: 1 | 24 | 168; accessMode?: AccessMode }): Room {
    let code: string;
    let attempts = 0;

    do {
      code = generateRoomCode();
      attempts++;
      if (attempts > 10) throw new Error("Failed to generate unique room code");
    } while (rooms.has(code));

    const expiryHours = options.expiryHours ?? 24;
    const expiresAt = new Date(Date.now() + EXPIRY_OPTIONS[expiryHours]).toISOString();
    const now = new Date().toISOString();

    const room: RoomEntity = {
      code,
      accessMode: options.accessMode ?? AccessMode.FULL_ACCESS,
      createdAt: now,
      expiresAt,
      isPinned: false,
      contentCount: 0,
      lastActivity: now,
      contentIds: [],
    };

    rooms.set(code, room);
    return toPublicRoom(room);
  },

  getRoom(code: string): Room | null {
    const room = rooms.get(code);
    if (!room) return null;
    if (isExpired(room)) {
      roomService.deleteRoom(code);
      return null;
    }
    return toPublicRoom(room);
  },

  getRoomWithIds(code: string): (Room & { contentIds: string[] }) | null {
    const room = rooms.get(code);
    if (!room) return null;
    if (isExpired(room)) {
      roomService.deleteRoom(code);
      return null;
    }
    return { ...toPublicRoom(room), contentIds: room.contentIds };
  },

  updateAccessMode(code: string, accessMode: AccessMode): Room | null {
    const room = rooms.get(code);
    if (!room) return null;
    room.accessMode = accessMode;
    room.lastActivity = new Date().toISOString();
    return toPublicRoom(room);
  },

  updateExpiry(code: string, expiryHours: 1 | 24 | 168): Room | null {
    const room = rooms.get(code);
    if (!room) return null;
    room.expiresAt = new Date(Date.now() + EXPIRY_OPTIONS[expiryHours]).toISOString();
    room.isPinned = false;
    room.lastActivity = new Date().toISOString();
    return toPublicRoom(room);
  },

  pinRoom(code: string, pinned: boolean): Room | null {
    const room = rooms.get(code);
    if (!room) return null;
    room.isPinned = pinned;
    if (pinned) {
      room.expiresAt = null;
    } else {
      room.expiresAt = new Date(Date.now() + EXPIRY_OPTIONS[24]).toISOString();
    }
    room.lastActivity = new Date().toISOString();
    return toPublicRoom(room);
  },

  addContentId(code: string, contentId: string): void {
    const room = rooms.get(code);
    if (!room) return;
    room.contentIds.push(contentId);
    room.contentCount++;
    room.lastActivity = new Date().toISOString();
  },

  removeContentId(code: string, contentId: string): void {
    const room = rooms.get(code);
    if (!room) return;
    room.contentIds = room.contentIds.filter((id) => id !== contentId);
    room.contentCount = Math.max(0, room.contentCount - 1);
    room.lastActivity = new Date().toISOString();
  },

  deleteRoom(code: string): void {
    rooms.delete(code);
  },

  getAllRooms(): Room[] {
    return [...rooms.values()].map(toPublicRoom);
  },

  cleanupExpiredRooms(): string[] {
    const expired: string[] = [];
    for (const [code, room] of rooms.entries()) {
      if (isExpired(room)) {
        rooms.delete(code);
        expired.push(code);
      }
    }
    return expired;
  },
};

function isExpired(room: RoomEntity): boolean {
  if (room.isPinned || !room.expiresAt) return false;
  return Date.now() > new Date(room.expiresAt).getTime();
}

function toPublicRoom(room: RoomEntity): Room {
  return {
    code: room.code,
    accessMode: room.accessMode,
    createdAt: room.createdAt,
    expiresAt: room.expiresAt,
    isPinned: room.isPinned,
    contentCount: room.contentCount,
    lastActivity: room.lastActivity,
  };
}

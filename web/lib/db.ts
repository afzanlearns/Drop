import { join } from 'path';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { cwd } from 'process';

const DATA_DIR = join(cwd(), 'data');
const DB_PATH = join(DATA_DIR, 'db.json');

export interface Room {
    id: string;
    code: string;
    createdAt: string;
    expiresAt: string | null;
}

export interface ContentItem {
    id: string;
    type: string;
    content: string; // text content or file path
    originalFilename?: string;
    mimeType?: string;
    size?: number;
    createdAt: string;
    roomId: string;
}

interface DatabaseSchema {
    rooms: Room[];
    contentItems: ContentItem[];
}

// Initial state
let dbCache: DatabaseSchema | null = null;

async function ensureDb() {
    if (dbCache) return dbCache;

    try {
        await mkdir(DATA_DIR, { recursive: true });
        const data = await readFile(DB_PATH, 'utf-8');
        dbCache = JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or error, init empty
        dbCache = { rooms: [], contentItems: [] };
        await saveDb();
    }
    return dbCache!;
}

async function saveDb() {
    if (!dbCache) return;
    try {
        await mkdir(DATA_DIR, { recursive: true });
        await writeFile(DB_PATH, JSON.stringify(dbCache, null, 2));
    } catch (e) {
        console.error("Failed to save DB", e);
    }
}

// --- API ---

export const DB = {
    async getRoom(code: string) {
        const db = await ensureDb();
        return db.rooms.find(r => r.code === code) || null;
    },

    async createRoom(room: Room) {
        const db = await ensureDb();
        db.rooms.push(room);
        await saveDb();
        return room;
    },

    async addContent(item: ContentItem) {
        const db = await ensureDb();
        db.contentItems.unshift(item); // Add to top
        await saveDb();
        return item;
    },

    async getRoomContent(roomId: string) {
        const db = await ensureDb();
        return db.contentItems.filter(i => i.roomId === roomId);
    },

    // For cleanup/expiry later
    async getAllRooms() {
        const db = await ensureDb();
        return db.rooms;
    }
};

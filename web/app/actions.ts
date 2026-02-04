'use server';

import { redirect } from 'next/navigation';
import { generateRoomCode } from '@/services/RoomService';
import { DB } from '@/lib/db';

export async function createRoom() {
    const code = generateRoomCode();

    await DB.createRoom({
        id: crypto.randomUUID(),
        code,
        createdAt: new Date().toISOString(),
        expiresAt: null
    });

    redirect(`/${code}`);
}

export async function navigateToRoom(code: string) {
    if (code) {
        redirect(`/${code}`);
    }
}

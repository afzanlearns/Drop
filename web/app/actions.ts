'use server';

import { redirect } from 'next/navigation';
import { generateRoomCode } from '@/services/RoomService';

export async function createRoom() {
    const code = generateRoomCode();
    // TODO: Save room to database/storage
    redirect(`/${code}`);
}

export async function navigateToRoom(code: string) {
    if (code) {
        redirect(`/${code}`);
    }
}

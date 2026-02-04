import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;
    const room = await DB.getRoom(code);

    if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const items = await DB.getRoomContent(room.id);
    return NextResponse.json({ room, items });
}

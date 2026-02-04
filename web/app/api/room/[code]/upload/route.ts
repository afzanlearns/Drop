import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { saveFile } from '@/lib/storage';
import { detectContentType } from '@/services/ContentService';

const MAX_ROOM_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;
    const room = await DB.getRoom(code);

    if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check current usage
    const currentItems = await DB.getRoomContent(room.id);
    const currentUsage = currentItems.reduce((acc, item) => acc + (item.size || 0), 0);

    if (currentUsage >= MAX_ROOM_SIZE_BYTES) {
        return NextResponse.json({ error: 'Room storage limit reached (50MB)' }, { status: 413 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check if adding this file exceeds limit
    if (currentUsage + file.size > MAX_ROOM_SIZE_BYTES) {
        return NextResponse.json({ error: 'File exceeds remaining room storage' }, { status: 413 });
    }

    // Save to disk
    const saved = await saveFile(file);

    // Save to DB
    const newItem = await DB.addContent({
        id: crypto.randomUUID(),
        roomId: room.id,
        type: detectContentType(file.type, file.name),
        content: saved.path, // Store the public URL
        originalFilename: file.name,
        mimeType: file.type,
        size: saved.size,
        createdAt: new Date().toISOString()
    });

    return NextResponse.json(newItem);
}

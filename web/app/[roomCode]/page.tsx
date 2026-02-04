import { Timeline } from '@/components/room/Timeline';
import { RoomHeader } from '@/components/room/RoomHeader';
import { DB } from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function RoomPage({ params }: { params: Promise<{ roomCode: string }> }) {
    const { roomCode } = await params;
    const room = await DB.getRoom(roomCode);

    if (!room) {
        notFound();
    }

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-mono">
            <RoomHeader roomCode={roomCode} />
            <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 md:p-8 relative">
                <Timeline roomCode={roomCode} />
            </main>
        </div>
    )
}

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Copy, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function RoomHeader({ roomCode }: { roomCode: string }) {
    const copyCode = () => {
        navigator.clipboard.writeText(window.location.href);
        // Could add toast here
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
                <Link href="/" className="font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
                    Instant<span className="text-accent">Rooms</span>
                </Link>

                <div className="flex items-center gap-2 md:gap-4">
                    <div className="hidden md:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <span className="text-sm text-zinc-500">CODE:</span>
                        <span className="font-mono font-medium tracking-wider">{roomCode}</span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium">
                        <span>24h</span>
                    </div>

                    <Button variant="ghost" size="sm" onClick={copyCode} title="Copy Link">
                        <Copy className="w-4 h-4" />
                    </Button>

                    <Button variant="primary" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                </div>
            </div>
        </header>
    );
}

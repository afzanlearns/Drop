'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { createRoom, navigateToRoom } from './actions';
import { useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';

export default function Home() {
  const [code, setCode] = useState('');

  const handleJoin = () => {
    if (code) navigateToRoom(code);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-dot-pattern">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-2xl mb-16 z-10"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-foreground">
          Instant Rooms
        </h1>
        <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
          Frictionless, secure, <span className="accent-italic font-medium">room-based</span> sharing.
          <br />
          No accounts. No history. Just drop.
        </p>
      </motion.div>

      <Card glass className="w-full max-w-md p-8 flex flex-col gap-8 z-10">
        <form action={createRoom} className="w-full">
          <Button className="w-full group" size="lg">
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
            Create Instant Room
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-semibold">
            <span className="bg-white dark:bg-black px-4 text-zinc-400">
              Or join existing
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <Input
            placeholder="ENTER CODE"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="font-mono text-center uppercase tracking-widest"
            maxLength={8}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          />
          <Button
            variant="secondary"
            onClick={handleJoin}
            disabled={!code || code.length < 8}
            className="aspect-square p-0 w-12 flex items-center justify-center"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </Card>

      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
      </div>
    </main>
  );
}

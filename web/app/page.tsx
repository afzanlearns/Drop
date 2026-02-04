'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { createRoom, navigateToRoom } from './actions';
import { useState } from 'react';
import { ArrowRight, Plus, Shield, Zap, Ghost, Globe, Github, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [code, setCode] = useState('');

  const handleJoin = () => {
    if (code) navigateToRoom(code);
  };

  return (
    <div className="min-h-screen flex flex-col font-mono bg-zinc-50 dark:bg-black text-foreground">

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/50 dark:bg-black/50 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight">
            Instant<span className="text-accent">Rooms</span>
          </Link>
          <div className="flex gap-6 text-sm font-medium text-zinc-500">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col relative overflow-hidden pt-32 pb-20 px-6">
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Instant Rooms
            </h1>
            <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto">
              Frictionless, secure, <span className="accent-italic font-medium">real-time</span> sharing.
              <br />
              No accounts. No history. Just drop.
            </p>
          </motion.div>

          <Card glass className="w-full max-w-md p-8 flex flex-col gap-8 z-10 shadow-2xl border-zinc-200 dark:border-zinc-800">
            <form action={createRoom} className="w-full">
              <Button className="w-full group h-14 text-lg" size="lg">
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
                className="font-mono text-center uppercase tracking-widest h-14 text-lg"
                maxLength={8}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
              <Button
                variant="secondary"
                onClick={handleJoin}
                disabled={!code || code.length < 8}
                className="aspect-square p-0 w-14 h-14 flex items-center justify-center"
              >
                <ArrowRight className="w-6 h-6" />
              </Button>
            </div>
          </Card>
        </div>

        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]" />
        </div>
      </main>

      {/* FEATURES SECTION (Below Fold) */}
      <section id="features" className="py-24 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Instant Rooms?</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">We stripped away everything that gets in the way of sharing.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-yellow-500" />}
              title="Zero Friction"
              desc="No signups, no logins, no app installs. Just a URL and you're in."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-green-500" />}
              title="Secure & Private"
              desc="Rooms are temporary. Data is encrypted in transit and purged automatically."
            />
            <FeatureCard
              icon={<Ghost className="w-6 h-6 text-purple-500" />}
              title="Ephemeral by Design"
              desc="Every room has an expiration date. Share what you need, then let it vanish."
            />
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-24 bg-zinc-50 dark:bg-black border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">About The Project</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
            Instant Rooms was born from a simple frustration: why is sending a file to someone standing next to you still so hard?
            AirDrop fails, email has limits, and chat apps compress images.
          </p>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We built a minimal, web-first solution that works on any device with a browser.
            Open a room, drop your files, and share the code. That's it.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-lg">Instant<span className="text-accent">Rooms</span></span>
            <span className="text-zinc-400">© 2026 Open Source Project</span>
          </div>

          <div className="flex items-center gap-6 text-zinc-500">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <div className="flex gap-4 ml-4">
              <a href="https://github.com" target="_blank" className="hover:text-foreground"><Github className="w-5 h-5" /></a>
              <a href="https://twitter.com" target="_blank" className="hover:text-foreground"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <Card className="p-8 hover:border-accent/50 transition-colors">
      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <p className="text-zinc-500 leading-relaxed">{desc}</p>
    </Card>
  );
}

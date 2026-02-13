/**
 * Landing Page
 * The main entry point for Drop
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../api/client';
import ThemeToggle from '../components/ThemeToggle';
import Button from '../components/Button';

export default function Landing() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const room = await roomApi.createRoom();
      navigate(`/room/${room.id}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Drop
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            A <span className="italic text-primary-600 dark:text-primary-400">lightweight</span>, room-based platform for sharing{' '}
            <span className="italic text-primary-600 dark:text-primary-400">text</span>,{' '}
            <span className="italic text-primary-600 dark:text-primary-400">code</span>,{' '}
            <span className="italic text-primary-600 dark:text-primary-400">images</span>, and{' '}
            <span className="italic text-primary-600 dark:text-primary-400">PDFs</span>.
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12">
            No accounts. No friction. Just drop and share.
          </p>
          <Button
            size="lg"
            onClick={handleCreateRoom}
            isLoading={isCreating}
            className="px-8 py-4 text-lg"
          >
            Create Room
          </Button>
        </div>

        {/* About Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-white">
            What is Drop?
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Drop is a content sharing platform that sits between Pastebin and Google Drive. It's{' '}
              <span className="italic">lighter</span> than Drive,{' '}
              <span className="italic">richer</span> than Pastebin, and{' '}
              <span className="italic">calmer</span> than Notion.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Create a room instantly and start dropping content. Share the link with anyone. No
              signup, no onboarding, no complexity.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Perfect for quick collaborations, code reviews, sharing designs, or sending files
              without the overhead of traditional platforms.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-8 text-gray-900 dark:text-white">
            What Drop Provides
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              title="Instant Rooms"
              description="Create shareable rooms in one click. No registration, no waiting."
            />
            <FeatureCard
              title="Multi-Format Support"
              description="Text, code snippets, images, and PDFs—all in one place."
            />
            <FeatureCard
              title="Smart Detection"
              description="Paste anything and Drop figures out what it is. No manual selection needed."
            />
            <FeatureCard
              title="Temporary by Default"
              description="Rooms expire automatically after 7 days. Zero long-term commitment."
            />
            <FeatureCard
              title="Drag & Drop"
              description="Drag files anywhere in the room. It just works."
            />
            <FeatureCard
              title="One-Click Export"
              description="Download entire room contents as a ZIP file anytime."
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-16 pb-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            <strong>Drop</strong> · Share content, not complexity
          </p>
        </footer>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

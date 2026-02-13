/**
 * Room Header Component
 * Shows room info and provides controls
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import type { Room } from '../../../shared/types';
import ThemeToggle from './ThemeToggle';
import Button from './Button';
import { roomApi } from '../api/client';

interface RoomHeaderProps {
  room: Room;
}

export default function RoomHeader({ room }: RoomHeaderProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const roomUrl = `${window.location.origin}/room/${room.id}`;
  const expiresIn = formatDistanceToNow(new Date(room.expiresAt), { addSuffix: true });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleExport = () => {
    window.location.href = roomApi.getExportUrl(room.id);
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Home link */}
          <button
            onClick={handleHome}
            className="text-2xl font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            Drop
          </button>

          {/* Center: Room code */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <button
                onClick={handleCopyLink}
                className="font-mono text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                title="Click to copy link"
              >
                {room.id}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Expires {expiresIn}
              </p>
            </div>
            {copied && (
              <span className="text-sm text-green-600 dark:text-green-400">Copied!</span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleExport}>
              Export
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

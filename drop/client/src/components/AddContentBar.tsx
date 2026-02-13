/**
 * Add Content Bar Component
 * Fixed bottom bar for adding text and code content
 */

import { useState, useRef, KeyboardEvent } from 'react';
import { roomApi } from '../api/client';
import { useRoomStore } from '../stores/roomStore';
import Button from './Button';

interface AddContentBarProps {
  roomId: string;
}

export default function AddContentBar({ roomId }: AddContentBarProps) {
  const { addItem } = useRoomStore();
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'text' | 'code'>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const item = await roomApi.createItem(roomId, {
        type: mode,
        content: content.trim(),
      });
      addItem(item);
      setContent('');
      textareaRef.current?.focus();
    } catch (err) {
      console.error('Failed to create item:', err);
      alert('Failed to add content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Auto-detect code (if it contains code-like patterns)
    if (mode === 'text' && detectCode(pastedText)) {
      setMode('code');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40">
      <div className="max-w-4xl mx-auto px-6 py-4">
        {/* Mode selector */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setMode('text')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              mode === 'text'
                ? 'bg-primary-600 text-white dark:bg-primary-500'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Text
          </button>
          <button
            onClick={() => setMode('code')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              mode === 'code'
                ? 'bg-primary-600 text-white dark:bg-primary-500'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Code
          </button>
        </div>

        {/* Input area */}
        <div className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              mode === 'code'
                ? 'Paste your code here...'
                : 'Type or paste text here... (Ctrl/Cmd + Enter to send)'
            }
            className={`flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
              mode === 'code' ? 'font-mono text-sm' : ''
            }`}
            rows={3}
            disabled={isSubmitting}
          />
          <Button
            onClick={handleSubmit}
            disabled={!content.trim()}
            isLoading={isSubmitting}
            className="self-end"
          >
            Drop
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Drag files anywhere or paste text here • Ctrl/Cmd + Enter to send
        </p>
      </div>
    </div>
  );
}

/**
 * Simple code detection heuristic
 */
function detectCode(text: string): boolean {
  const codeIndicators = [
    /function\s+\w+\s*\(/,
    /const\s+\w+\s*=/,
    /let\s+\w+\s*=/,
    /var\s+\w+\s*=/,
    /class\s+\w+/,
    /import\s+.+from/,
    /export\s+(default|const|class|function)/,
    /{[\s\S]*}/,
    /def\s+\w+\s*\(/,
    /public\s+class/,
    /#include\s*</,
  ];

  return codeIndicators.some((pattern) => pattern.test(text));
}

/**
 * Content Item Component
 * Renders a single content item (text, code, image, or PDF)
 */

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { RoomItem } from '../../../shared/types';
import { useRoomStore } from '../stores/roomStore';
import { roomApi } from '../api/client';
import Button from './Button';
import PDFViewer from './PDFViewer';

interface ContentItemProps {
  item: RoomItem;
  roomId: string;
}

export default function ContentItem({ item, roomId }: ContentItemProps) {
  const { removeItem } = useRoomStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this item?')) return;

    setIsDeleting(true);
    try {
      await roomApi.deleteItem(roomId, item.id);
      removeItem(item.id);
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  const timestamp = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TypeIcon type={item.type} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
            {item.type}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{timestamp}</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          isLoading={isDeleting}
          className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
        >
          Delete
        </Button>
      </div>

      {/* Content */}
      <div className="p-6">
        {item.type === 'text' && <TextContent content={item.content || ''} />}
        {item.type === 'code' && <CodeContent content={item.content || ''} />}
        {item.type === 'image' && <ImageContent item={item} />}
        {item.type === 'pdf' && <PDFContent item={item} />}
      </div>
    </div>
  );
}

function TypeIcon({ type }: { type: string }) {
  const icons = {
    text: (
      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
    code: (
      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    image: (
      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    pdf: (
      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  };

  return icons[type as keyof typeof icons] || icons.text;
}

function TextContent({ content }: { content: string }) {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">{content}</p>
    </div>
  );
}

function CodeContent({ content }: { content: string }) {
  return (
    <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
      <code className="text-sm font-mono text-gray-900 dark:text-gray-100">{content}</code>
    </pre>
  );
}

function ImageContent({ item }: { item: RoomItem }) {
  const url = (item.metadata as any)?.url || (item as any).url;

  return (
    <div>
      {item.fileName && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{item.fileName}</p>
      )}
      <img
        src={url}
        alt={item.fileName || 'Image'}
        className="max-w-full h-auto rounded-lg"
        loading="lazy"
      />
    </div>
  );
}

function PDFContent({ item }: { item: RoomItem }) {
  const url = (item.metadata as any)?.url || (item as any).url;

  return (
    <div>
      {item.fileName && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{item.fileName}</p>
      )}
      <PDFViewer url={url} />
    </div>
  );
}

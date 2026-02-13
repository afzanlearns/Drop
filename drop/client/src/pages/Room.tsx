/**
 * Room Page
 * The main workspace where users drop and view content
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { roomApi } from '../api/client';
import { useRoomStore } from '../stores/roomStore';
import RoomHeader from '../components/RoomHeader';
import ContentTimeline from '../components/ContentTimeline';
import AddContentBar from '../components/AddContentBar';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Room() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { room, items, isLoading, error, setRoom, setItems, addItem, setLoading, setError } =
    useRoomStore();
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

  // Load room data
  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const loadRoom = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await roomApi.getRoom(id);
        setRoom(data.room);
        setItems(data.items);
      } catch (err: any) {
        const message = err.response?.data?.message || 'Failed to load room';
        setError(message);

        if (err.response?.status === 404) {
          setTimeout(() => navigate('/'), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [id, navigate, setRoom, setItems, setLoading, setError]);

  // Handle file drops
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!id) return;

      for (const file of acceptedFiles) {
        const uploadId = `${file.name}-${Date.now()}`;
        setUploadingFiles((prev) => [...prev, uploadId]);

        try {
          const item = await roomApi.uploadFile(id, file);
          addItem(item);
        } catch (err) {
          console.error('Upload failed:', err);
          alert(`Failed to upload ${file.name}`);
        } finally {
          setUploadingFiles((prev) => prev.filter((id) => id !== uploadId));
        }
      }
    },
    [id, addItem]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 52428800, // 50MB
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {error}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div
      {...getRootProps()}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24"
    >
      <input {...getInputProps()} />

      {/* Drag overlay */}
      {isDragActive && (
        <div className="fixed inset-0 bg-primary-500/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              Drop files here
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <RoomHeader room={room} />

      {/* Main content area */}
      <div className="max-w-4xl mx-auto px-6 pt-24">
        {items.length === 0 && uploadingFiles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
              This room is empty
            </p>
            <p className="text-gray-400 dark:text-gray-500">
              Start by pasting text or dragging files
            </p>
          </div>
        ) : (
          <>
            <ContentTimeline items={items} roomId={id!} />
            
            {/* Show uploading indicators */}
            {uploadingFiles.map((uploadId) => (
              <div
                key={uploadId}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-4 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <LoadingSpinner size="sm" />
                  <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Add content bar */}
      <AddContentBar roomId={id!} />
    </div>
  );
}

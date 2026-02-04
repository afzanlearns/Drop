/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileIcon, FileText, Image as ImageIcon, Code, Download, Trash2, Eye, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ContentType } from '@/services/ContentService';
import { exportRoomAsZip } from '@/services/ExportService';

interface ContentItem {
    id: string;
    type: string;
    content: string; // URL
    originalFilename?: string;
    mimeType?: string;
    size?: number;
    createdAt: string;
}

export function Timeline({ roomCode }: { roomCode: string }) {
    const [items, setItems] = useState<ContentItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewingItem, setViewingItem] = useState<ContentItem | null>(null);

    // Polling
    const fetchItems = useCallback(async () => {
        try {
            const res = await fetch(`/api/room/${roomCode}`);
            if (res.ok) {
                const data = await res.json();
                setItems(data.items);
            }
        } catch (e) {
            console.error("Polling error", e);
        }
    }, [roomCode]);

    useEffect(() => {
        fetchItems();
        const interval = setInterval(fetchItems, 3000);
        return () => clearInterval(interval);
    }, [fetchItems]);

    const handleUpload = async (file: File) => {
        setError(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`/api/room/${roomCode}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                setError(errData.error || 'Upload failed');
                return;
            }

            // Optimistic update or just wait for poll? 
            // Let's wait for poll or manually trigger
            fetchItems();
        } catch (e) {
            setError("Network error during upload");
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            files.forEach(f => handleUpload(f));
        } else {
            // Handle text drop if needed (create blob)
            const text = e.dataTransfer.getData('text');
            if (text) {
                const blob = new Blob([text], { type: 'text/plain' });
                const file = new File([blob], `note-${Date.now()}.txt`, { type: 'text/plain' });
                handleUpload(file);
            }
        }
    }, []);

    // Paste Listener
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (e.clipboardData?.files.length) {
                const files = Array.from(e.clipboardData.files);
                files.forEach(f => handleUpload(f));
            } else {
                const text = e.clipboardData?.getData('text');
                if (text) {
                    const blob = new Blob([text], { type: 'text/plain' });
                    const file = new File([blob], `paste-${Date.now()}.txt`, { type: 'text/plain' });
                    handleUpload(file);
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    return (
        <div
            className="flex-1 flex flex-col gap-6"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Viewer Modal */}
            <AnimatePresence>
                {viewingItem && (
                    <ViewerModal item={viewingItem} onClose={() => setViewingItem(null)} />
                )}
            </AnimatePresence>

            {/* Drop Overlay */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-accent/5 backdrop-blur-sm border-2 border-dashed border-accent rounded-3xl z-40 flex items-center justify-center m-4"
                    >
                        <div className="bg-background/80 p-8 rounded-full shadow-2xl border border-border">
                            <UploadCloud className="w-16 h-16 text-accent" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toolbar */}
            <div className="flex justify-between items-center mb-2 px-1">
                <h2 className="text-sm font-bold text-zinc-400 tracking-wider uppercase">Timeline</h2>
                <div className="flex items-center gap-4">
                    {error && <span className="text-red-500 text-sm font-medium animate-pulse">{error}</span>}
                    {items.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => exportRoomAsZip(items, roomCode)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download All
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4 pb-20">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                        <UploadCloud className="w-12 h-12 mb-4 opacity-50" />
                        <p className="font-medium">Timeline Empty</p>
                        <p className="text-sm opacity-70">Drag files or paste content anywhere</p>
                    </div>
                ) : (
                    items.map((item, idx) => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            idx={idx}
                            onView={() => setViewingItem(item)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function ItemCard({ item, idx, onView }: { item: ContentItem, idx: number, onView: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            layout
        >
            <Card className="p-0 overflow-hidden border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md transition-shadow group">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs text-zinc-500 font-mono">
                    <span className="uppercase font-bold tracking-wider flex items-center gap-2">
                        {getIcon(item.type)}
                        {item.type}
                    </span>
                    <div className="flex items-center gap-2">
                        <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
                    </div>
                </div>

                <div className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 overflow-hidden">
                        {/* Thumbnail / Icon */}
                        <div className="w-12 h-12 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.type === 'image' || item.type === ContentType.IMAGE ? (
                                <img src={item.content} alt="thumb" className="w-full h-full object-cover" />
                            ) : (
                                <FileText className="w-6 h-6 text-zinc-400" />
                            )}
                        </div>

                        <div className="min-w-0">
                            <p className="font-medium truncate text-sm">
                                {item.originalFilename || 'Untitled'}
                            </p>
                            <p className="text-xs text-zinc-400 mt-1 font-mono">
                                {formatBytes(item.size || 0)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={onView}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                        </Button>
                        <a href={item.content} download={item.originalFilename} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

function ViewerModal({ item, onClose }: { item: ContentItem, onClose: () => void }) {
    const isImage = item.type === 'image' || item.mimeType?.startsWith('image/');
    const isPdf = item.mimeType === 'application/pdf';
    const isText = item.mimeType?.startsWith('text/');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-medium truncate max-w-md">{item.originalFilename}</h3>
                    <div className="flex items-center gap-2">
                        <a href={item.content} download={item.originalFilename}>
                            <Button variant="ghost" size="sm">Download</Button>
                        </a>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-zinc-100 dark:bg-black/50 overflow-auto flex items-center justify-center p-4">
                    {isImage ? (
                        <img src={item.content} alt="Preview" className="max-w-full max-h-full object-contain shadow-lg rounded-lg" />
                    ) : (isPdf || isText) ? (
                        <iframe src={item.content} className="w-full h-full bg-white rounded-lg shadow-sm border-none" />
                    ) : (
                        <div className="text-center p-8">
                            <FileIcon className="w-16 h-16 mx-auto mb-4 text-zinc-400" />
                            <p className="text-zinc-500">Preview not available for this file type.</p>
                            <Button className="mt-4" onClick={() => window.open(item.content, '_blank')}>
                                Download to View
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

function getIcon(type: string) {
    if (type === 'image') return <ImageIcon className="w-3 h-3" />;
    if (type === 'code') return <Code className="w-3 h-3" />;
    return <FileIcon className="w-3 h-3" />;
}

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

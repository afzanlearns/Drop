'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileIcon, FileText, Image as ImageIcon, Code } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { detectContentType, ContentType } from '@/services/ContentService';

interface ContentItemData {
    id: string;
    type: ContentType;
    content: string | File;
    timestamp: Date;
}

export function Timeline({ roomCode }: { roomCode: string }) {
    const [items, setItems] = useState<ContentItemData[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        // Check if leaving the window or just the element
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const newItems = files.map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                type: detectContentType(file.type, file.name),
                content: file,
                timestamp: new Date()
            }));
            setItems(prev => [...newItems, ...prev]);
        } else {
            const text = e.dataTransfer.getData('text');
            if (text) {
                addItem(text, ContentType.TEXT);
            }
        }
    }, []);

    const addItem = (content: string | File, type: ContentType) => {
        setItems(prev => [{
            id: Math.random().toString(36).substr(2, 9),
            type,
            content,
            timestamp: new Date()
        }, ...prev]);
    };

    // Paste Listener
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (e.clipboardData?.files.length) {
                const files = Array.from(e.clipboardData.files);
                files.forEach(file => addItem(file, detectContentType(file.type, file.name)));
            } else {
                const text = e.clipboardData?.getData('text');
                if (text) {
                    // Simple heuristic: if it looks like code?
                    addItem(text, ContentType.TEXT);
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
            {/* Drop Overlay */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-accent/5 backdrop-blur-sm border-2 border-dashed border-accent rounded-3xl z-50 flex items-center justify-center m-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-background/80 p-8 rounded-full shadow-2xl border border-border"
                        >
                            <UploadCloud className="w-16 h-16 text-accent" />
                            <p className="mt-4 font-bold text-lg text-center">DROP TO SHARE</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col gap-4 py-4">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                        <UploadCloud className="w-12 h-12 mb-4 opacity-50" />
                        <p className="font-medium">Timeline Empty</p>
                        <p className="text-sm opacity-70">Drag files or paste content (Ctrl+V) anywhere</p>
                    </div>
                ) : (
                    items.map((item, idx) => (
                        <ItemCard key={item.id} item={item} idx={idx} />
                    ))
                )}
            </div>
        </div>
    );
}

function ItemCard({ item, idx }: { item: ContentItemData, idx: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
        >
            <Card className="p-0 overflow-hidden border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs text-zinc-500 font-mono">
                    <span className="uppercase font-bold tracking-wider flex items-center gap-2">
                        {getIcon(item.type)}
                        {item.type}
                    </span>
                    <span>{item.timestamp.toLocaleTimeString()}</span>
                </div>

                <div className="p-5">
                    {item.type === ContentType.TEXT ? (
                        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/90">
                            {item.content as string}
                        </pre>
                    ) : item.type === ContentType.IMAGE && item.content instanceof File ? (
                        <div className="rounded-lg overflow-hidden bg-zinc-100 dark:bg-black/20">
                            {/* In real app, use URL.createObjectURL or proper upload url */}
                            <img
                                src={URL.createObjectURL(item.content)}
                                alt="Shared content"
                                className="max-h-96 w-auto mx-auto object-contain"
                                onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <div className="w-12 h-12 bg-white dark:bg-black rounded-lg shadow-sm flex items-center justify-center">
                                <FileText className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                                <p className="font-medium truncate max-w-md text-sm">
                                    {item.content instanceof File ? item.content.name : 'Unknown File'}
                                </p>
                                <p className="text-xs text-zinc-400 mt-1 font-mono">
                                    {item.content instanceof File ? formatBytes(item.content.size) : ''}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}

function getIcon(type: ContentType) {
    switch (type) {
        case ContentType.TEXT: return <FileText className="w-3 h-3" />;
        case ContentType.CODE: return <Code className="w-3 h-3" />;
        case ContentType.IMAGE: return <ImageIcon className="w-3 h-3" />;
        default: return <FileIcon className="w-3 h-3" />;
    }
}

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

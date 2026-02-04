import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ContentType } from './ContentService';

interface ExportItem {
    type: string;
    content: string; // URL or text
    originalFilename?: string;
    timestamp?: string;
    createdAt?: string; // DB uses createdAt
}

export async function exportRoomAsZip(items: ExportItem[], roomCode: string) {
    const zip = new JSZip();
    const folder = zip.folder(`room-${roomCode}`);

    if (!folder) return;

    // Use Promise.all to fetch files in parallel
    await Promise.all(items.map(async (item, index) => {
        const dateStr = item.createdAt || item.timestamp || new Date().toISOString();
        const timestamp = new Date(dateStr).toISOString().replace(/[:.]/g, '-');

        if (item.type === ContentType.TEXT || item.type === 'text') {
            // For text type, if content is a URL (from backend), we fetch it. 
            // If it was local text, it might be raw string. 
            // BUT in our new backend, even text is saved as file mostly if uploaded via Blob? 
            // Wait, Timeline creates Blob/File for text pastes. So it goes to Backend as File -> URL.
            // So essentially EVERYTHING is a URL now.

            // Check if content looks like a URL (starts with / or http)
            if (item.content.startsWith('/') || item.content.startsWith('http')) {
                try {
                    const res = await fetch(item.content);
                    const blob = await res.blob();
                    folder.file(`note-${timestamp}-${index}.txt`, blob);
                } catch (e) {
                    console.error("Failed to fetch text", e);
                }
            } else {
                // Fallback for direct content?
                folder.file(`note-${timestamp}-${index}.txt`, item.content);
            }
        } else {
            // It is a file (Image, PDF, Blob)
            const filename = item.originalFilename || `file-${index}`;
            try {
                const res = await fetch(item.content);
                const blob = await res.blob();
                folder.file(filename, blob);
            } catch (e) {
                console.error(`Failed to fetch ${filename}`, e);
            }
        }
    }));

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `instant-room-${roomCode}.zip`);
}

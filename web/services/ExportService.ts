import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ContentType } from './ContentService';

export async function exportRoomAsZip(items: any[], roomCode: string) {
    const zip = new JSZip();
    // Create a folder inside the zip
    const folder = zip.folder(`room-${roomCode}`);

    if (!folder) return;

    items.forEach((item, index) => {
        // Generate filename logic
        const timestamp = new Date(item.timestamp).toISOString().replace(/[:.]/g, '-');

        if (item.type === ContentType.TEXT) {
            folder.file(`note-${timestamp}-${index}.txt`, item.content);
        } else if (item.content instanceof File) {
            folder.file(item.content.name, item.content);
        }
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `instant-room-${roomCode}.zip`);
}

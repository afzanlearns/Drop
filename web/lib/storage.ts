import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { cwd } from 'process';

const UPLOAD_DIR = join(cwd(), 'public', 'uploads');

export async function saveFile(file: File): Promise<{ filename: string; path: string; size: number }> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure directory exists
    try {
        await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (e) {
        // ignore if exists
    }

    // Unique filename: timestamp-originalName
    // Sanitize filename to remove weird characters
    const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${sanitizedOriginal}`;
    const path = join(UPLOAD_DIR, filename);

    await writeFile(path, buffer);

    return {
        filename,
        path: `/uploads/${filename}`, // Public URL path
        size: file.size
    };
}

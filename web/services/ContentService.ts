export enum ContentType {
    TEXT = "text",
    CODE = "code",
    IMAGE = "image",
    PDF = "pdf",
    FILE_BLOB = "file_blob"
}

export function detectContentType(mimeType: string, fileName?: string): ContentType {
    if (!mimeType) return ContentType.FILE_BLOB;

    const lowerMime = mimeType.toLowerCase();

    if (lowerMime.startsWith('image/')) return ContentType.IMAGE;
    if (lowerMime === 'application/pdf') return ContentType.PDF;

    // Text based
    if (lowerMime.startsWith('text/') ||
        lowerMime.includes('json') ||
        lowerMime.includes('javascript') ||
        lowerMime.includes('xml')) {
        return ContentType.TEXT;
    }

    return ContentType.FILE_BLOB;
}

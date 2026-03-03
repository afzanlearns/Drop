import archiver from "archiver";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import { ContentItem, ContentType } from "../../../shared/types";
import path from "path";
import fs from "fs";

export const exportService = {
  async exportAsZip(roomCode: string, items: ContentItem[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const archive = archiver("zip", { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archive.on("data", (chunk: Buffer) => chunks.push(chunk));
      archive.on("end", () => resolve(Buffer.concat(chunks)));
      archive.on("error", reject);

      // Add metadata JSON
      const metadata = {
        roomCode,
        exportedAt: new Date().toISOString(),
        itemCount: items.length,
        items: items.map((item) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          createdAt: item.createdAt,
          metadata: item.metadata,
        })),
      };
      archive.append(JSON.stringify(metadata, null, 2), { name: "metadata.json" });

      // Add text content
      for (const item of items) {
        if ((item.type === ContentType.TEXT || item.type === ContentType.CODE) && item.content) {
          const ext = item.type === ContentType.CODE
            ? getCodeExtension(item.metadata.language ?? "txt")
            : "txt";
          const filename = item.title
            ? sanitizeFilename(item.title) + "." + ext
            : `${item.id.slice(0, 8)}.${ext}`;
          archive.append(item.content, { name: `content/${filename}` });
        } else if (item.fileId) {
          const filePath = path.join(process.cwd(), "..", "uploads", item.fileId);
          if (fs.existsSync(filePath)) {
            const originalName = item.metadata.filename
              ? sanitizeFilename(item.metadata.filename)
              : item.fileId;
            archive.file(filePath, { name: `files/${originalName}` });
          }
        }
      }

      archive.finalize();
    });
  },

  exportAsMarkdown(roomCode: string, items: ContentItem[]): string {
    const lines: string[] = [
      `# Room ${roomCode}`,
      "",
      `> Exported on ${new Date().toLocaleString()}`,
      "",
      "---",
      "",
    ];

    for (const item of items) {
      const timestamp = new Date(item.createdAt).toLocaleString();
      const typeLabel = item.type.replace("_", " ").toUpperCase();

      lines.push(`## ${item.title ?? typeLabel}`);
      lines.push(`*${timestamp}*`);
      lines.push("");

      switch (item.type) {
        case ContentType.TEXT:
          lines.push(item.content ?? "");
          break;
        case ContentType.CODE: {
          const lang = item.metadata.language ?? "";
          lines.push("```" + lang);
          lines.push(item.content ?? "");
          lines.push("```");
          break;
        }
        case ContentType.IMAGE:
          lines.push(`![${item.title ?? "image"}](${item.fileUrl ?? ""})`);
          break;
        case ContentType.PDF:
          lines.push(`[Download PDF: ${item.metadata.filename ?? item.id}](${item.fileUrl ?? ""})`);
          break;
        case ContentType.FILE_BLOB:
          lines.push(`[Download: ${item.metadata.filename ?? item.id}](${item.fileUrl ?? ""})`);
          break;
      }

      lines.push("", "---", "");
    }

    return lines.join("\n");
  },

  async exportAsPdf(roomCode: string, items: ContentItem[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const chunks: Buffer[] = [];
      const passThrough = new PassThrough();

      passThrough.on("data", (chunk: Buffer) => chunks.push(chunk));
      passThrough.on("end", () => resolve(Buffer.concat(chunks)));
      passThrough.on("error", reject);

      doc.pipe(passThrough);

      // Title page
      doc
        .font("Helvetica-Bold")
        .fontSize(24)
        .text(`Room: ${roomCode}`, { align: "center" });
      doc.moveDown(0.5);
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Exported on ${new Date().toLocaleString()}`, { align: "center" });
      doc.moveDown(0.5);
      doc.text(`${items.length} item(s)`, { align: "center" });
      doc.moveDown(2);

      // Separator
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);

      // Content items
      for (const item of items) {
        const timestamp = new Date(item.createdAt).toLocaleString();
        const typeLabel = item.type.replace("_", " ").toUpperCase();

        doc.font("Helvetica-Bold").fontSize(14).text(item.title ?? typeLabel);
        doc.font("Helvetica").fontSize(10).fillColor("#666666").text(timestamp);
        doc.moveDown(0.5);
        doc.fillColor("#000000");

        switch (item.type) {
          case ContentType.TEXT:
            doc.font("Helvetica").fontSize(11).text(item.content ?? "", { width: 495 });
            break;
          case ContentType.CODE:
            doc.font("Courier").fontSize(9).text(item.content ?? "", { width: 495 });
            break;
          case ContentType.IMAGE:
            doc.font("Helvetica").fontSize(11).text(`[Image: ${item.metadata.filename ?? item.id}]`);
            doc.text(`URL: ${item.fileUrl ?? "N/A"}`);
            break;
          case ContentType.PDF:
          case ContentType.FILE_BLOB:
            doc.font("Helvetica").fontSize(11).text(`[File: ${item.metadata.filename ?? item.id}]`);
            doc.text(`Size: ${formatFileSize(item.metadata.size ?? 0)}`);
            break;
        }

        doc.moveDown(1);

        // Check if we need a new page
        if (doc.y > 700 && items.indexOf(item) < items.length - 1) {
          doc.addPage();
        }
      }

      doc.end();
    });
  },
};

function getCodeExtension(language: string): string {
  const map: Record<string, string> = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    rust: "rs",
    go: "go",
    java: "java",
    php: "php",
    html: "html",
    css: "css",
    sql: "sql",
    bash: "sh",
  };
  return map[language.toLowerCase()] ?? language;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

# Instant Rooms

> Drop anything. Share instantly. No accounts required.

Instant Rooms is a premium, modern SaaS platform designed for frictionless and elegant content sharing. Create a secure room in seconds, share the access code, and seamlessly drop files, text snippets, code blocks with syntax highlighting, or PDFs. 

Built with a sophisticated, detail-oriented UI featuring a rich color palette, soft modern shadows, and high-quality typographic choices, Instant Rooms brings a world-class user experience to everyday temporary sharing.

---

## 🌟 Key Features

- **Instant, Account-less Collaboration**: Generate 8-character secure, collision-safe alphanumeric rooms instantly.
- **Premium User Interface**: Modern design system utilizing elegant shadow elevations, sophisticated color palettes (Milk, Stone, Clay, Graphite), and smooth micro-animations.
- **Multi-Format Content Support**:
  - Text and Code blocks (with automatic Prism.js syntax highlighting)
  - Image uploads with integrated zoom/lightbox and preview
  - Native inline PDF Viewer for document sharing
  - Generic File Blobs for any other format up to 10MB
- **Smart Detection**: Automatically detects code syntax vs. plain text when pasting content.
- **Access Control**: Fine-grained access modes (Full Access, Read-Only, Drop-Only for anonymous dropboxes).
- **Time Travel & History**: Snapshot-based version history allowing the room creator to restore past states.
- **Content Expiry Management**: Rooms and individual items can be configured to auto-delete (1 hour, 24 hours, 7 days, or pinned permanently).
- **Robust Export System**: Export an entire room's contents as a ZIP archive, Markdown document, or PDF file.
- **Security & Integrity**: Per-IP rate limiting to protect against abuse, and strict MIME-type file validations.

---

## 🛠️ Tech Stack

| Layer     | Technology                                               |
|-----------|----------------------------------------------------------|
| **Frontend**  | React 18, Vite, TypeScript, Tailwind CSS v3 (customized) |
| **State**     | Zustand                                                  |
| **Typography**| Geist Mono (Google Fonts)                                |
| **Icons**     | Phosphor Icons (@phosphor-icons/react)                   |
| **Uploads**   | react-dropzone                                           |
| **PDF View**  | react-pdf (PDF.js)                                       |
| **Syntax**    | Prism.js (Custom Dark Theme Tokens)                      |
| **Backend**   | Node.js, Express, TypeScript                             |
| **Validation**| Zod                                                      |
| **Storage**   | In-memory (Map) + Local disk storage for files           |
| **File I/O**  | Multer                                                   |
| **Export**    | archiver (ZIP), pdfkit (PDF)                             |

---

## 📂 Project Structure

```
instant-rooms/
├── shared/
│   └── types.ts              # Shared TypeScript interfaces for Client & Server
├── server/
│   ├── src/
│   │   ├── index.ts          # Express entry point
│   │   ├── routes/           # REST endpoints (rooms, content, export)
│   │   ├── services/         # Core business logic
│   │   ├── middleware/       # Rate limiting, error handling
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── pages/            # LandingPage and RoomPage
│   │   ├── components/       # UI Components (content blocks, layout, room features)
│   │   ├── store/            # Zustand state management
│   │   ├── styles.css        # Core Design System Variables & Custom CSS
│   │   ├── utils/
│   │   └── tests/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── uploads/                  # Server-side file storage (Ignored in Git)
└── README.md
```

---

## 🚀 Setup & Running Locally

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Start the Backend Server
```bash
cd server
npm install
npm run dev
```
The server will start on **http://localhost:4000**. Uploaded files will be stored in the auto-generated `../uploads/` directory at the project root.

### 2. Start the Frontend Client
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
The client will start on **http://localhost:5173**. 

### 3. Build for Production
```bash
# Build and start server
cd server
npm run build
npm start

# Build client
cd client
npm run build
```

---

## 📡 API Reference

### Rooms
- `POST /api/rooms` — Create a new room
- `GET /api/rooms/:code` — Get room details
- `PATCH /api/rooms/:code/access` — Update access mode (Full, Read-Only, Drop-Only)
- `PATCH /api/rooms/:code/expiry` — Update room expiry duration
- `PATCH /api/rooms/:code/pin` — Pin or unpin a room permanently
- `GET /api/rooms/:code/history` — Get version snapshots of the room
- `POST /api/rooms/:code/restore` — Restore room to a specific snapshot

### Content
- `POST /api/content/text` — Add a new text or code block
- `POST /api/content/upload` — Upload a file (Image, PDF, Document)
- `GET /api/content/:roomCode` — List all content within a room
- `DELETE /api/content/:contentId` — Delete a specific content item

### Export
- `POST /api/export/:roomCode/zip` — Export room contents as a ZIP archive
- `POST /api/export/:roomCode/md` — Export room contents as a Markdown document
- `POST /api/export/:roomCode/pdf` — Export room contents as a PDF document

---

## 🧪 Testing

Run frontend tests (validates room properties, timelines, and logic):
```bash
cd client
npm test
```
Tests cover:
- Room code uniqueness and entropy security.
- Content storage integrity.
- Timeline chronological ordering.

---

## ☁️ Deployment Guidelines (Vercel)

This application consists of a separate frontend and backend. 

**Important Caveat**: This project currently uses in-memory storage (JavaScript Maps) and local file storage (`uploads/`). This architecture is perfect for testing, local deployments, or VPS environments (like Render or DigitalOcean), but is **not suitable for serverless environments** out of the box. 

If deploying to Vercel or AWS Lambda, you will need to replace:
1. In-memory storage with a persistent database (e.g., Upstash Redis or Vercel Postgres).
2. Local file uploads with cloud storage (e.g., AWS S3, Vercel Blob Storage).

### Deployment via VPS (Recommended)
You can deploy this directly to a VPS or PaaS like Railway, Render, or Fly.io by building both the frontend and backend, serving the static frontend files via Express, and persisting the `uploads/` volume.

---

## 🎨 Design Philosophy

Instant Rooms recently underwent a complete UI transformation. We moved away from harsh brutalist themes towards a sleek, highly-polished modern aesthetic inspired by premium SaaS tools. 

Highlights of the design system:
- **Depth & Elevation**: Layered shadows and glassmorphic panels.
- **Harmonious Colors**: Custom CSS variables managing primary tones (Milk, Stone, Clay) that translate cleanly between light and dark modes.
- **Typography**: Exclusive use of `Geist Mono` for a precise, developer-friendly feel.

---

*Built with ❤️ and TypeScript. No `any` types.*

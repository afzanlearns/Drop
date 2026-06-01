# Instant Rooms

> **Drop anything. Share instantly. No accounts required.**

A premium, modern SaaS platform for frictionless content sharing. Create secure rooms in seconds, share a code, and seamlessly collaborate without friction.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#-key-features)
- [Design Philosophy](#-design-philosophy)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Development](#-development)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## Overview

Instant Rooms reimagines how teams share files and collaborate. Forget cumbersome logins, account creation, and security headaches. 

**Create a room in one click.** Share the code. **Drop your files, code, PDFs, or text.** It disappears when you're done.

Perfect for:
- 🎨 Design handoffs and feedback
- 📝 Code snippets and documentation
- 📊 Quick data sharing between teams
- 💬 Temporary collaboration spaces
- 🔐 Secure file exchanges (no accounts needed)

---

## 🌟 Key Features

### ⚡ Instant & Frictionless
- Generate unique rooms in **one click**
- No signups, no logins, no friction
- 8-character secure, collision-safe alphanumeric codes
- Share a code, start collaborating immediately

### 🎨 Premium User Experience
- Sleek, modern design inspired by premium SaaS tools
- Sophisticated color palette with smooth transitions
- Fluid micro-animations and polished interactions
- Responsive across desktop, tablet, and mobile
- Light and dark mode support

### 📦 Multi-Format Content Support
- **Text & Code**: Automatic syntax detection with Prism.js highlighting
- **Images**: Integrated lightbox zoom and preview
- **PDFs**: Native inline viewer for seamless document sharing
- **Files**: Support for any file format up to 10MB
- Smart format detection on paste

### 🔐 Fine-Grained Access Control
- **Full Access**: Complete read/write/delete permissions
- **Read-Only**: View-only access for secure sharing
- **Drop-Only**: Anonymous dropbox mode for collecting submissions
- Customize per room in real-time

### ⏱️ Intelligent Expiry Management
- Configure auto-delete timings: 1 hour, 24 hours, 7 days
- Pin content permanently if needed
- Automatic data wiping—no trace left behind
- Time-based lifecycle management

### 📜 Version Control & History
- Snapshot-based version history
- Restore entire room to previous states
- Track what changed and when
- Revert unwanted changes instantly

### 💾 Powerful Export System
- Export as **ZIP archive** (all files bundled)
- Export as **Markdown document** (text and metadata)
- Export as **PDF** (structured report format)
- Download and preserve room contents permanently

### 🛡️ Security & Reliability
- Per-IP rate limiting to prevent abuse
- Strict MIME-type file validation
- TypeScript for type-safe operations
- Zod schema validation on all inputs

---

## 🎨 Design Philosophy

Instant Rooms underwent a complete visual transformation to become a **premium, modern SaaS experience**. We moved beyond brutalist minimalism to create something genuinely beautiful and polished.

### Design Principles
- **Depth & Elevation**: Layered shadows create visual hierarchy and sophistication
- **Harmonious Colors**: A custom palette (Milk, Stone, Clay, Graphite) that translates seamlessly between light and dark themes
- **Precision Typography**: Exclusive use of **Geist Mono** for a precise, developer-friendly aesthetic
- **Smooth Interactions**: All micro-interactions are thoughtfully animated (200-300ms transitions)
- **Whitespace**: Generous breathing room for clarity and elegance

### Color System
| Name | Light Mode | Dark Mode | Purpose |
|------|-----------|-----------|---------|
| **Milk** | #FFFFFF | #F1F5F9 | Primary backgrounds & text |
| **Stone** | #E2E8F0 | #334155 | Borders & secondary surfaces |
| **Clay** | #0052CC | #3B82F6 | Accent color for CTAs & highlights |
| **Graphite** | #0F172A | #0F172A | Text & dark elements |

---

## 🛠️ Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 with TypeScript |
| **Build Tool** | Vite (lightning-fast bundling) |
| **Styling** | Tailwind CSS v3 (custom theme) |
| **State** | Zustand (lightweight & performant) |
| **Icons** | Phosphor Icons |
| **File Upload** | react-dropzone |
| **PDF Viewer** | react-pdf (PDF.js) |
| **Code Syntax** | Prism.js with custom theme |
| **Font** | Geist Mono (Google Fonts) |

### Backend
| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js |
| **Language** | TypeScript |
| **Validation** | Zod |
| **File Upload** | Multer |
| **Export** | archiver (ZIP), pdfkit (PDF) |
| **Storage** | In-memory (Maps) + Local disk |

### Database & Storage
- **Current**: In-memory storage + local file system
- **Scalable Alternative**: Upstash Redis + AWS S3 / Vercel Blob Storage

---

## 📂 Project Structure

```
instant-rooms/
├── 📁 shared/
│   └── types.ts                    # Shared TypeScript types (Client & Server)
│
├── 📁 server/
│   ├── src/
│   │   ├── index.ts                # Express.js entry point
│   │   ├── routes/                 # REST API endpoints
│   │   │   ├── rooms.ts            # Room CRUD operations
│   │   │   ├── content.ts          # Content management
│   │   │   └── export.ts           # Export functionality
│   │   ├── services/               # Business logic layer
│   │   │   ├── RoomService.ts
│   │   │   ├── ContentService.ts
│   │   │   └── ExportService.ts
│   │   ├── middleware/             # Express middleware
│   │   │   ├── rateLimiter.ts
│   │   │   └── errorHandler.ts
│   │   └── utils/
│   │       ├── generateCode.ts
│   │       └── validators.ts
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx      # Hero & room creation
│   │   │   └── RoomPage.tsx         # Main collaboration interface
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Header.tsx
│   │   │   ├── RoomCard.tsx
│   │   │   ├── ContentBlock.tsx
│   │   │   ├── FileUploadZone.tsx
│   │   │   └── ...
│   │   ├── store/
│   │   │   └── roomStore.ts         # Zustand state management
│   │   ├── styles.css               # Design system variables
│   │   ├── utils/
│   │   │   ├── api.ts
│   │   │   └── helpers.ts
│   │   └── tests/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── 📁 uploads/                      # Server-side file storage (Git-ignored)
├── .gitignore
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18 or higher ([Download](https://nodejs.org/))
- **npm**: v9 or higher (comes with Node.js)
- **Git**: For cloning the repository

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/instant-rooms.git
cd instant-rooms
```

### Step 2: Start the Backend Server
```bash
cd server
npm install
npm run dev
```

The backend will start on **`http://localhost:4000`**

Uploaded files will be stored in `../uploads/` (auto-generated)

### Step 3: Start the Frontend Client (New Terminal)
```bash
cd client
npm install
npm run dev
```

The frontend will start on **`http://localhost:5173`**

### Step 4: Open in Browser
Navigate to **`http://localhost:5173`** and start creating rooms!

---

## 💻 Development

### Available Scripts

#### Frontend
```bash
cd client

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Lint code
npm run lint
```

#### Backend
```bash
cd server

# Start development server with auto-restart
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development
LOG_LEVEL=debug

# CORS Settings
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=../uploads

# Optional: Cloud Storage (for production)
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=your-bucket
# AWS_ACCESS_KEY_ID=xxx
# AWS_SECRET_ACCESS_KEY=xxx
```

### Hot Module Reload (HMR)
Both frontend and backend support HMR. Changes to files will automatically refresh without losing state.

---

## 📡 API Reference

### Authentication
All endpoints are public. Rate limiting is applied per IP address to prevent abuse.

### Base URL
- Development: `http://localhost:4000/api`
- Production: `https://your-domain.com/api`

### Rooms Endpoints

#### Create a Room
```http
POST /api/rooms
Content-Type: application/json

{
  "name": "My Collaboration Room",
  "accessMode": "full"  // "full" | "read-only" | "drop-only"
}

Response: 201 Created
{
  "code": "XK7mH2p0",
  "name": "My Collaboration Room",
  "createdAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-01-16T10:30:00Z"
}
```

#### Get Room Details
```http
GET /api/rooms/:code

Response: 200 OK
{
  "code": "XK7mH2p0",
  "name": "My Collaboration Room",
  "accessMode": "full",
  "itemCount": 5,
  "createdAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-01-16T10:30:00Z"
}
```

#### Update Access Mode
```http
PATCH /api/rooms/:code/access
Content-Type: application/json

{
  "accessMode": "read-only"  // "full" | "read-only" | "drop-only"
}

Response: 200 OK
```

#### Update Expiry Duration
```http
PATCH /api/rooms/:code/expiry
Content-Type: application/json

{
  "expiryDuration": "24h"  // "1h" | "24h" | "7d" | "never"
}

Response: 200 OK
```

#### Pin/Unpin Room
```http
PATCH /api/rooms/:code/pin
Content-Type: application/json

{
  "pinned": true  // true | false
}

Response: 200 OK
```

#### Get Room History
```http
GET /api/rooms/:code/history

Response: 200 OK
{
  "snapshots": [
    {
      "id": "snap_001",
      "timestamp": "2024-01-15T10:30:00Z",
      "itemCount": 3
    },
    ...
  ]
}
```

#### Restore Room to Snapshot
```http
POST /api/rooms/:code/restore
Content-Type: application/json

{
  "snapshotId": "snap_001"
}

Response: 200 OK
```

### Content Endpoints

#### Add Text or Code Block
```http
POST /api/content/text
Content-Type: application/json

{
  "roomCode": "XK7mH2p0",
  "content": "function hello() { console.log('world'); }",
  "type": "code",  // "text" | "code"
  "language": "javascript"  // Optional, auto-detected if omitted
}

Response: 201 Created
{
  "id": "content_123",
  "type": "code",
  "language": "javascript",
  "content": "function hello() { ... }",
  "createdAt": "2024-01-15T10:35:00Z"
}
```

#### Upload File
```http
POST /api/content/upload
Content-Type: multipart/form-data

FormData:
  - roomCode: "XK7mH2p0"
  - file: <binary file data>

Response: 201 Created
{
  "id": "content_124",
  "type": "file",  // "image" | "pdf" | "file"
  "filename": "design.pdf",
  "size": 2048576,
  "mimeType": "application/pdf",
  "createdAt": "2024-01-15T10:36:00Z"
}
```

#### List Room Content
```http
GET /api/content?roomCode=XK7mH2p0

Response: 200 OK
{
  "items": [
    {
      "id": "content_123",
      "type": "code",
      "language": "javascript",
      "content": "..."
    },
    {
      "id": "content_124",
      "type": "pdf",
      "filename": "design.pdf"
    }
  ]
}
```

#### Delete Content
```http
DELETE /api/content/:contentId

Response: 204 No Content
```

### Export Endpoints

#### Export as ZIP
```http
POST /api/export/:roomCode/zip

Response: 200 OK
Content-Type: application/zip
<binary zip file>
```

#### Export as Markdown
```http
POST /api/export/:roomCode/md

Response: 200 OK
Content-Type: text/markdown
# Room: XK7mH2p0
...
```

#### Export as PDF
```http
POST /api/export/:roomCode/pdf

Response: 200 OK
Content-Type: application/pdf
<binary pdf file>
```

---

## 🧪 Testing

### Frontend Tests
```bash
cd client
npm test
```

**Test Coverage**:
- ✅ Room code uniqueness and entropy
- ✅ Content storage integrity
- ✅ Timeline chronological ordering
- ✅ Access mode validation
- ✅ Export functionality

### Running Specific Tests
```bash
# Watch mode for active development
npm test -- --watch

# Coverage report
npm test -- --coverage
```

---

## ☁️ Deployment

### ⚠️ Important Caveat
This project currently uses **in-memory storage** and **local file system** for uploads. This works perfectly for testing and VPS deployments but is **not suitable for serverless** (Vercel, AWS Lambda) out of the box.

### Option 1: VPS Deployment (Recommended) ✅

Deploy to **Railway**, **Render**, **Fly.io**, or **DigitalOcean**:

#### Step 1: Build Both Applications
```bash
# Build frontend
cd client
npm run build

# Build backend
cd server
npm run build
```

#### Step 2: Serve Frontend via Express
The backend can serve the built frontend as static files:

```typescript
// In server/src/index.ts
app.use(express.static('../client/dist'));
app.get('*', (req, res) => {
  res.sendFile('../client/dist/index.html');
});
```

#### Step 3: Deploy
Push to your Git provider (GitHub, GitLab) and connect to Railway/Render.

**Environment Variables** to set in your hosting platform:
```
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

### Option 2: Serverless Deployment (Advanced) 🚀

To deploy on **Vercel** or **AWS Lambda**, replace:
1. **In-memory storage** → **Upstash Redis** or **Vercel Postgres**
2. **Local file uploads** → **AWS S3** or **Vercel Blob Storage**

Example with Vercel Blob:
```typescript
import { put, get } from '@vercel/blob';

// Upload file
const blob = await put(filename, file);

// Retrieve file
const file = await get(blobUrl);
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 1. Fork the Repository
```bash
git clone https://github.com/yourusername/instant-rooms.git
cd instant-rooms
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/amazing-feature
```

### 3. Make Your Changes
- Follow the existing code style
- Write clear commit messages
- Add tests for new functionality
- Update documentation as needed

### 4. Run Tests & Linting
```bash
cd client && npm test && npm run lint
cd ../server && npm run lint
```

### 5. Push & Create a Pull Request
```bash
git push origin feature/amazing-feature
```

Then create a PR with a clear description of your changes.

### Code Standards
- ✅ Use TypeScript (no `any` types)
- ✅ Write descriptive variable names
- ✅ Add JSDoc comments for public functions
- ✅ Keep components focused and single-responsibility
- ✅ Use Zod for validation

---

<div align="center">

**Made with ❤️ and TypeScript. No `any` types.**

⭐ If you find Instant Rooms useful, please consider giving us a star on GitHub!

</div>
# Storage Strategy

## Overview

Drop uses a two-tier storage architecture: metadata in PostgreSQL and binary files in object storage. This separation allows for efficient querying, scalability, and cost optimization.

## Storage Tiers

### Tier 1: Database (PostgreSQL)
**What's Stored:**
- Room metadata (ID, creation time, expiry)
- Item metadata (type, filename, size, MIME type)
- File references (storage keys)
- Timestamps and relationships

**Why:**
- Fast querying and filtering
- Transactional integrity
- Relationship management
- Small footprint

**Not Stored:**
- Binary file data
- Image pixels
- PDF content

### Tier 2: Object Storage (S3 or Filesystem)
**What's Stored:**
- Images (JPEG, PNG, GIF, WebP)
- PDFs
- Large text files

**Why:**
- Designed for binary data
- Horizontal scalability
- CDN integration
- Cost-effective for large files

## Storage Backends

### Local Filesystem (Development)
```typescript
Structure:
/storage
  /uploads
    /{room-id}
      /{file-key}
```

**Pros:**
- Zero configuration
- Fast for development
- Easy debugging

**Cons:**
- Not horizontally scalable
- No built-in redundancy
- Manual backup required

**Use Cases:**
- Local development
- Testing
- Small single-server deployments

### S3-Compatible Storage (Production)
```typescript
Bucket structure:
drop-content/
  rooms/
    {room-id}/
      {file-key}
```

**Supported Services:**
- AWS S3
- Cloudflare R2
- DigitalOcean Spaces
- MinIO (self-hosted)
- Backblaze B2

**Pros:**
- Infinite scalability
- Built-in redundancy
- CDN integration
- Pay-per-use pricing
- Automatic backups

**Cons:**
- Requires configuration
- External dependency
- Slight latency vs local

**Use Cases:**
- Production deployments
- Multi-server setups
- High availability requirements

## File Key Generation

### Strategy
```typescript
fileKey = `${roomId}/${nanoid()}.${extension}`
```

**Example:**
```
abc123def456/xK9mP2nQ4rT8.jpg
```

**Properties:**
- Unique across entire system
- Self-organizing by room
- URL-safe characters
- No collisions (nanoid uses crypto-random)

### Benefits
1. **Namespace isolation**: Files organized by room
2. **No conflicts**: Random IDs prevent overwrites
3. **Cleanup efficiency**: Delete room folder to remove all files
4. **Audit trail**: File keys traceable to rooms

## Upload Flow

### Small Files (< 5MB)
```
Client → Server (multipart/form-data)
         ↓
      Validate
         ↓
   Write to storage
         ↓
   Create DB record
         ↓
    Return metadata
```

**Implementation:**
- Single HTTP request
- Server buffers in memory
- Simple error handling

### Large Files (> 5MB)
```
Client → POST /upload-url
         ↓
   Generate signed URL
         ↓
Client ← Return URL
         ↓
Direct upload to storage
         ↓
POST /complete
         ↓
   Create DB record
```

**Implementation:**
- Client uploads directly to S3
- Server never touches file data
- Reduces server load
- Faster for user

### Chunked Uploads (Future)
For very large files (>50MB), implement resumable uploads:
```
1. Client: Initiate multipart upload
2. Client: Upload chunks in parallel
3. Client: Complete multipart upload
4. Server: Verify and create record
```

## Access Control

### Signed URLs
**Purpose:** Temporary access to private storage

**Implementation:**
```typescript
// Generate signed URL valid for 1 hour
const url = await storage.getSignedUrl(fileKey, 3600);
```

**Flow:**
```
User → Frontend → GET /api/rooms/:id
                     ↓
                Query database
                     ↓
         Generate signed URLs for files
                     ↓
    Return metadata + signed URLs
                     ↓
Browser fetches files directly from storage
```

**Benefits:**
- Files remain private in storage
- Server doesn't proxy file data
- Automatic expiry
- Reduced bandwidth costs

### Public vs Private
**Current Implementation:** Private with signed URLs

**Alternative:** Public read access
- Simpler implementation
- No signed URL generation
- Faster first load
- Less secure (files accessible if key is known)

**Recommendation:** Stay with private + signed URLs for security

## Optimization Strategies

### 1. Image Optimization
```typescript
// On upload:
- Resize large images
- Convert to WebP
- Generate thumbnails
- Strip EXIF data
```

**Benefits:**
- Faster page loads
- Reduced storage costs
- Better mobile experience

**Implementation:**
```typescript
import sharp from 'sharp';

async function optimizeImage(buffer: Buffer) {
  return await sharp(buffer)
    .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
}
```

### 2. PDF Optimization
```typescript
// Lazy loading strategy:
- Load first page immediately
- Load remaining pages on scroll
- Cache loaded pages
```

**Benefits:**
- Fast initial render
- Lower memory usage
- Better UX for large PDFs

### 3. Caching Strategy
```typescript
// Client-side:
- Cache API responses (5 minutes)
- Cache file URLs until expiry
- Service worker for offline access

// Server-side:
- Cache-Control headers on static assets
- CloudFlare or CDN in front
```

## Storage Quotas

### File Size Limits
```typescript
const LIMITS = {
  image: 10 * 1024 * 1024,  // 10MB
  pdf: 50 * 1024 * 1024,    // 50MB
  text: 1 * 1024 * 1024,    // 1MB
  total: 500 * 1024 * 1024, // 500MB per room
};
```

### Enforcement
1. **Client-side**: Validate before upload
2. **Server-side**: Reject oversized requests
3. **Storage-side**: Bucket policies (S3)

### User Communication
```typescript
// Clear error messages:
"File too large. Maximum size: 50MB"
"Room storage limit reached: 500MB"
```

## Cleanup and Lifecycle

### Room Deletion
```typescript
async function deleteRoom(roomId: string) {
  // 1. Get all items
  const items = await db.roomItem.findMany({ where: { roomId } });
  
  // 2. Delete files from storage
  await Promise.all(
    items.map(item => item.fileKey && storage.delete(item.fileKey))
  );
  
  // 3. Delete database records (cascade)
  await db.room.delete({ where: { id: roomId } });
}
```

### Orphaned Files
**Problem:** Files in storage without database records

**Detection:**
```typescript
// Weekly job:
1. List all file keys in storage
2. Query database for corresponding records
3. Delete files without records
```

**Prevention:**
- Transactional creates (DB record first, then file)
- Cleanup on failed uploads
- Monitoring and alerts

### Expiry Cleanup
```typescript
// Runs every hour:
cron.schedule('0 * * * *', async () => {
  const expired = await db.room.findMany({
    where: { expiresAt: { lt: new Date() } }
  });
  
  for (const room of expired) {
    await deleteRoom(room.id);
  }
});
```

## Backup Strategy

### Database Backups
- **Frequency**: Daily automated backups
- **Retention**: 30 days
- **Testing**: Monthly restore tests

### Storage Backups
- **S3 versioning**: Enabled
- **Lifecycle policies**: Archive to Glacier after 90 days
- **Cross-region replication**: For disaster recovery

### Restore Procedures
1. Restore database from latest backup
2. Verify data integrity
3. Sync storage if needed
4. Run validation scripts
5. Test critical paths

## Cost Optimization

### Storage Costs
```
AWS S3 Pricing (example):
- Storage: $0.023 per GB/month
- Requests: $0.0004 per 1000 PUT, $0.0004 per 10000 GET
- Transfer: $0.09 per GB (out to internet)

For 1000 rooms with avg 100MB each:
- Storage: 100GB = $2.30/month
- Requests: ~$5/month
- Transfer: ~$50/month (if all downloaded once)

Total: ~$60/month for significant usage
```

### Optimization Tactics
1. **CloudFlare R2**: No egress fees
2. **Compression**: Reduce storage footprint
3. **Lifecycle policies**: Auto-delete expired rooms
4. **CDN caching**: Reduce origin requests

## Monitoring

### Metrics to Track
- Storage utilization (GB)
- Upload success/failure rate
- Average file size
- Orphaned file count
- Signed URL generation rate
- Storage latency (p50, p95, p99)

### Alerts
- Storage utilization > 80%
- Failed upload rate > 5%
- Orphaned files > 1000
- Expiry job failures

## Migration Strategies

### Local to S3
```typescript
// One-time migration script:
1. List all local files
2. Upload each to S3
3. Update database with new keys
4. Verify migration
5. Delete local files
6. Update config
```

### S3 to S3 (Different region/provider)
```typescript
// Use AWS CLI or rclone:
aws s3 sync s3://old-bucket s3://new-bucket
```

### Zero-Downtime Migration
1. Write to both old and new storage
2. Backfill new storage with old data
3. Switch reads to new storage
4. Remove old storage writes
5. Decommission old storage

---

This storage strategy balances performance, cost, and reliability while keeping the system simple and maintainable.

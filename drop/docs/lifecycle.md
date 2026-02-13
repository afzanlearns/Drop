# Room Lifecycle

## Overview

Drop rooms are designed to be temporary by default. This document describes the complete lifecycle of a room from creation to deletion, including expiry policies, cleanup jobs, and user interactions.

## Lifecycle Stages

### 1. Creation
```
User clicks "Create Room" → Room is born
```

**What Happens:**
- Generate unique room ID (12 characters, URL-safe)
- Set creation timestamp
- Calculate expiry date (default: 7 days from now)
- Create database record
- Return room URL to user

**Database Record:**
```typescript
{
  id: "abc123def456",
  createdAt: "2024-02-01T10:00:00Z",
  expiresAt: "2024-02-08T10:00:00Z"
}
```

### 2. Active Period
```
Creation → Activity → Expiry Date
```

**User Actions:**
- Add content (text, code, images, PDFs)
- View content
- Share room link
- Export content
- Delete items

**System Behavior:**
- Accept uploads
- Serve content
- Track activity (optional)
- Allow modifications

### 3. Expiry
```
Expiry Date Reached → Grace Period → Hard Delete
```

**Phases:**

#### Soft Expiry (Day 0)
- Room still accessible
- Read-only mode enabled
- Banner: "This room expired X hours ago"
- Can export but not add content

#### Grace Period (Days 1-2)
- Final chance to export
- Visible countdown
- Email notification (if contacts added)

#### Hard Delete (Day 3)
- Room permanently deleted
- All content removed
- URL returns 404
- Storage cleaned up

### 4. Deletion
```
Room deleted → Content purged → Database cleaned
```

**Deletion Triggers:**
1. Expiry cleanup job
2. Manual deletion by user
3. Moderation action (abuse)
4. Storage quota enforcement

**Deletion Process:**
```typescript
async function deleteRoom(roomId: string) {
  // 1. Find all items
  const items = await db.roomItem.findMany({
    where: { roomId }
  });

  // 2. Delete files from storage
  for (const item of items) {
    if (item.fileKey) {
      await storage.delete(item.fileKey);
    }
  }

  // 3. Delete database records (cascades to items)
  await db.room.delete({
    where: { id: roomId }
  });

  // 4. Log deletion
  logger.info('Room deleted', { roomId, itemCount: items.length });
}
```

## Expiry Policies

### Default TTL
**Duration:** 7 days from creation

**Rationale:**
- Long enough for most use cases
- Short enough to prevent abuse
- Encourages intentional usage

### Extended TTL (Future)
Users could extend room lifetime:
- Pin feature (never expires)
- Custom expiry date
- Usage-based extension

**Implementation:**
```typescript
interface Room {
  expiresAt: Date;
  isPinned: boolean;
  maxExpiresAt: Date; // Absolute limit
}
```

### Expiry Calculation
```typescript
function calculateExpiry(createdAt: Date, ttlDays: number = 7): Date {
  const expiry = new Date(createdAt);
  expiry.setDate(expiry.getDate() + ttlDays);
  return expiry;
}

// Usage:
const room = {
  createdAt: new Date(),
  expiresAt: calculateExpiry(new Date(), 7)
};
```

## Cleanup Jobs

### Hourly Cleanup Job
```typescript
import cron from 'node-cron';

// Runs every hour at :00
cron.schedule('0 * * * *', async () => {
  await cleanupExpiredRooms();
});

async function cleanupExpiredRooms() {
  const now = new Date();
  
  // Find expired rooms
  const expiredRooms = await db.room.findMany({
    where: {
      expiresAt: { lt: now },
      isPinned: false // Don't delete pinned rooms
    },
    include: { items: true }
  });

  logger.info('Cleanup job started', {
    expiredCount: expiredRooms.length
  });

  // Delete each room
  for (const room of expiredRooms) {
    try {
      await deleteRoom(room.id);
      logger.info('Room deleted', { roomId: room.id });
    } catch (error) {
      logger.error('Room deletion failed', {
        roomId: room.id,
        error
      });
    }
  }

  logger.info('Cleanup job completed');
}
```

### Daily Orphan Cleanup
```typescript
// Runs at 3 AM daily
cron.schedule('0 3 * * *', async () => {
  await cleanupOrphanedFiles();
});

async function cleanupOrphanedFiles() {
  // 1. List all file keys in storage
  const storageKeys = await storage.listAll();
  
  // 2. Get all file keys from database
  const dbKeys = await db.roomItem.findMany({
    select: { fileKey: true }
  }).then(items => items.map(i => i.fileKey).filter(Boolean));

  // 3. Find orphaned keys
  const orphaned = storageKeys.filter(key => !dbKeys.includes(key));

  // 4. Delete orphaned files
  for (const key of orphaned) {
    await storage.delete(key);
    logger.info('Orphaned file deleted', { fileKey: key });
  }

  logger.info('Orphan cleanup completed', {
    orphanedCount: orphaned.length
  });
}
```

### Weekly Usage Report (Optional)
```typescript
// Runs Sunday at midnight
cron.schedule('0 0 * * 0', async () => {
  const stats = await db.room.aggregate({
    _count: true,
    _sum: {
      itemCount: true
    }
  });

  logger.info('Weekly stats', {
    totalRooms: stats._count,
    totalItems: stats._sum.itemCount
  });
});
```

## User Notifications

### Expiry Warning
**When:** 24 hours before expiry
**Channel:** In-app banner + email (if provided)

```typescript
async function sendExpiryWarnings() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const expiringRooms = await db.room.findMany({
    where: {
      expiresAt: {
        gte: tomorrow,
        lt: new Date(tomorrow.getTime() + 3600000) // +1 hour
      }
    }
  });

  for (const room of expiringRooms) {
    // Show banner in UI
    // Send email if contact exists
  }
}
```

### Post-Expiry Notice
**When:** Room is accessed after expiry
**Message:** 
```
This room expired on Feb 8, 2024.
You can still export the content, but cannot add new items.
The room will be permanently deleted in 2 days.
```

## Data Retention

### What's Kept
- Nothing after hard delete
- Rooms are truly deleted

### What's Logged
- Room creation (timestamp, ID)
- Deletion events (timestamp, reason)
- Aggregate stats (anonymous)

### Compliance
- GDPR: Right to deletion (already automatic)
- CCPA: No personal data stored
- HIPAA: Not applicable (no health data)

## Performance Considerations

### Cleanup Job Optimization

**Problem:** Deleting 10,000 rooms in one job could timeout

**Solution:** Batch processing
```typescript
async function cleanupExpiredRooms() {
  const BATCH_SIZE = 100;
  let offset = 0;

  while (true) {
    const batch = await db.room.findMany({
      where: { expiresAt: { lt: new Date() } },
      take: BATCH_SIZE,
      skip: offset
    });

    if (batch.length === 0) break;

    for (const room of batch) {
      await deleteRoom(room.id);
    }

    offset += BATCH_SIZE;
    
    // Breathing room between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
```

### Storage Deletion
**Problem:** Deleting files from S3 one-by-one is slow

**Solution:** Batch delete API
```typescript
// S3 supports deleting up to 1000 objects at once
await s3.deleteObjects({
  Bucket: bucket,
  Delete: {
    Objects: fileKeys.map(key => ({ Key: key }))
  }
});
```

## Edge Cases

### 1. Room Accessed During Deletion
**Problem:** User loads room while cleanup job is deleting it

**Solution:** Transaction with lock
```typescript
await db.$transaction(async (tx) => {
  const room = await tx.room.findUnique({
    where: { id: roomId },
    lock: 'FOR UPDATE'
  });

  if (!room) throw new Error('Room not found');
  
  // Proceed with deletion
});
```

### 2. Partial Deletion Failure
**Problem:** Database records deleted but storage deletion fails

**Solution:** Two-phase commit pattern
```typescript
// Phase 1: Mark for deletion
await db.room.update({
  where: { id: roomId },
  data: { deletionScheduled: true }
});

// Phase 2: Delete files
await deleteAllFiles(roomId);

// Phase 3: Complete deletion
await db.room.delete({ where: { id: roomId } });
```

### 3. Large Room Deletion
**Problem:** Room with 10,000 items takes too long

**Solution:** Background job
```typescript
// Queue deletion
await queue.add('delete-room', { roomId });

// Worker processes deletion
worker.process('delete-room', async (job) => {
  await deleteRoom(job.data.roomId);
});
```

## Future Enhancements

### User-Controlled Lifecycle
```typescript
interface Room {
  // Current
  expiresAt: Date;

  // Future additions
  isPinned: boolean;         // Never expires
  autoExtend: boolean;       // Extend on activity
  customTTL: number;         // User-set duration
  deleteAfterExport: boolean; // Auto-delete after first export
}
```

### Activity-Based Extension
```typescript
// Extend expiry when room is actively used
async function extendIfActive(roomId: string) {
  const recentActivity = await db.roomItem.count({
    where: {
      roomId,
      createdAt: { gte: new Date(Date.now() - 24 * 3600000) }
    }
  });

  if (recentActivity > 0) {
    await db.room.update({
      where: { id: roomId },
      data: { expiresAt: calculateExpiry(new Date(), 7) }
    });
  }
}
```

### Soft Delete (Trash)
```typescript
// Instead of hard delete, move to trash for 30 days
interface Room {
  deletedAt: Date | null;
  deletePermanentlyAt: Date | null;
}

// User can restore from trash
async function restoreRoom(roomId: string) {
  await db.room.update({
    where: { id: roomId },
    data: {
      deletedAt: null,
      deletePermanentlyAt: null,
      expiresAt: calculateExpiry(new Date(), 7)
    }
  });
}
```

## Monitoring and Alerts

### Metrics
- Rooms created per day
- Rooms expired per day
- Average room lifetime
- Cleanup job duration
- Orphaned files count

### Alerts
- Cleanup job failure
- Cleanup job duration > 5 minutes
- Orphaned files > 1000
- Room creation rate spike

### Dashboards
```
Room Lifecycle Dashboard
├── Active rooms over time
├── Expiry rate
├── Average items per room
├── Storage utilization
└── Cleanup job performance
```

---

This lifecycle model ensures rooms are temporary by default while providing flexibility for future enhancements. The cleanup jobs run reliably and handle edge cases gracefully.

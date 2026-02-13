/**
 * Content Timeline Component
 * Displays all room items in chronological order
 */

import type { RoomItem } from '../../../shared/types';
import ContentItem from './ContentItem';

interface ContentTimelineProps {
  items: RoomItem[];
  roomId: string;
}

export default function ContentTimeline({ items, roomId }: ContentTimelineProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <ContentItem key={item.id} item={item} roomId={roomId} />
      ))}
    </div>
  );
}

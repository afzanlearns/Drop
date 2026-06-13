import { useMemo } from "react";
import type { ContentItem } from "../../../../shared/types";
import { ContentType } from "../../../../shared/types";
import BoardColumn from "./BoardColumn";
import { useRoomStore } from "../../store/roomStore";
import { useCreator } from "../../hooks/useCreator";

interface BoardViewProps {
  items: ContentItem[];
}

export default function BoardView({ items }: BoardViewProps) {
  const { room } = useRoomStore();
  const { isCreator } = useCreator(room?.code);

  const columns = useMemo(() => {
    return {
      files: items.filter((i) => i.type === ContentType.IMAGE || i.type === ContentType.FILE_BLOB),
      docs: items.filter((i) => i.type === ContentType.PDF),
      text: items.filter((i) => i.type === ContentType.TEXT || i.type === ContentType.CODE),
    };
  }, [items]);

  return (
    <div className="h-full p-4 md:p-6 overflow-x-auto">
      <div className="flex gap-4 min-w-max lg:min-w-0 h-full">
        <div className="flex-1 flex flex-col gap-4 min-w-[280px]">
          <BoardColumn
            title="Images & Files"
            count={columns.files.length}
            accentColor="var(--info)"
            items={columns.files}
            emptyMessage="No images or files dropped yet"
            isCreator={isCreator}
          />
          <div className="lg:hidden">
            <BoardColumn
              title="Documents & PDFs"
              count={columns.docs.length}
              accentColor="var(--error)"
              items={columns.docs}
              emptyMessage="No PDFs uploaded yet"
              isCreator={isCreator}
            />
          </div>
        </div>
        <div className="hidden lg:flex flex-1 flex-col min-w-[280px]">
          <BoardColumn
            title="Documents & PDFs"
            count={columns.docs.length}
            accentColor="var(--error)"
            items={columns.docs}
            emptyMessage="No PDFs uploaded yet"
            isCreator={isCreator}
          />
        </div>
        <div className="flex-1 flex flex-col min-w-[280px]">
          <BoardColumn
            title="Text & Code"
            count={columns.text.length}
            accentColor="var(--accent)"
            items={columns.text}
            emptyMessage="No text or code added yet"
            isCreator={isCreator}
          />
        </div>
      </div>
    </div>
  );
}

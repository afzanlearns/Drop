import { useMemo } from "react";
import { Image, FilePdf, FileText, Code, File } from "@phosphor-icons/react";
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
      files: items.filter(
        (i) => i.type === ContentType.IMAGE || i.type === ContentType.FILE_BLOB
      ),
      docs: items.filter((i) => i.type === ContentType.PDF),
      text: items.filter(
        (i) => i.type === ContentType.TEXT || i.type === ContentType.CODE
      ),
    };
  }, [items]);

  return (
    <div className="h-full p-4 md:p-6 overflow-x-auto">
      <div className="flex gap-6 min-w-max lg:min-w-0 h-full">
        {/* Column 1: Images & Files (Desktop) / Combined Files+Docs (Tablet) */}
        <div className="flex-1 flex flex-col gap-6 min-w-[300px]">
          <BoardColumn
            title="Images & Files"
            count={columns.files.length}
            icon={Image}
            accentColor="var(--color-accent-blue)"
            items={columns.files}
            emptyMessage="No images or files dropped yet"
            isCreator={isCreator}
          />
          
          {/* Mobile/Tablet only: PDF Column nested if not enough space for 3 cols */}
          <div className="lg:hidden">
            <div className="flex items-center gap-3 my-3 px-1">
              <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
              <span
                className="text-[0.68rem] font-semibold px-2.5 py-0.5 rounded-full"
                style={{
                  background: "var(--color-surface-alt)",
                  color:      "var(--color-text-muted)",
                  border:     "1px solid var(--color-border)",
                }}
              >
                Documents
              </span>
              <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
            </div>
            <BoardColumn
              title="Documents & PDFs"
              count={columns.docs.length}
              icon={FilePdf}
              accentColor="var(--color-accent-red)"
              items={columns.docs}
              emptyMessage="No PDFs uploaded yet"
              isCreator={isCreator}
            />
          </div>
        </div>

        {/* Column 2: Documents & PDFs (Visible only on Desktop in its own slot) */}
        <div className="hidden lg:flex flex-1 flex-col min-w-[300px]">
          <BoardColumn
            title="Documents & PDFs"
            count={columns.docs.length}
            icon={FilePdf}
            accentColor="var(--color-accent-red)"
            items={columns.docs}
            emptyMessage="No PDFs uploaded yet"
            isCreator={isCreator}
          />
        </div>

        {/* Column 3: Text & Code */}
        <div className="flex-1 flex flex-col min-w-[300px]">
          <BoardColumn
            title="Text & Code"
            count={columns.text.length}
            icon={Code}
            accentColor="var(--color-brand)"
            items={columns.text}
            emptyMessage="No text or code added yet"
            isCreator={isCreator}
          />
        </div>
      </div>
    </div>
  );
}

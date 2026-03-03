import { AnimatePresence, motion } from "framer-motion";
import type { ContentItem } from "../../../../shared/types";
import ContentItemCard from "../content/ContentItem";

interface TimelineProps {
  items: ContentItem[];
}

export default function Timeline({ items }: TimelineProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center px-6 max-w-xs">
          <div className="w-14 h-14 border-2 border-dashed border-zinc-200 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <div className="w-2 h-2 rounded-full bg-zinc-300" />
          </div>
          <p className="text-sm font-medium text-zinc-500">No content yet</p>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
            Drop files, paste text, or add code blocks using the panel on the left.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-3 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-400 uppercase tracking-widest font-medium">
          Timeline
        </span>
        <span className="text-xs text-zinc-300 font-mono">{items.length} item{items.length !== 1 ? "s" : ""}</span>
      </div>

      <AnimatePresence initial={false}>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, scale: 0.97 }}
            transition={{
              duration: 0.35,
              delay: index < 5 ? index * 0.05 : 0,
              ease: [0.16, 1, 0.3, 1],
            }}
            layout
          >
            <ContentItemCard item={item} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

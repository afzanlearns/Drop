import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "@phosphor-icons/react";
import { useRoomStore } from "../../store/roomStore";

export function ToastContainer() {
  const { toasts, removeToast } = useRoomStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 20, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-diffuse border max-w-xs
              ${toast.type === "success"
                ? "bg-white border-emerald-100 text-zinc-700"
                : toast.type === "error"
                ? "bg-white border-red-100 text-zinc-700"
                : "bg-white border-zinc-100 text-zinc-700"
              }`}
          >
            {toast.type === "success" && <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" weight="fill" />}
            {toast.type === "error" && <XCircle size={16} className="text-red-500 flex-shrink-0" weight="fill" />}
            {toast.type === "info" && <Info size={16} className="text-blue-500 flex-shrink-0" weight="fill" />}
            <p className="text-sm">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-1 text-zinc-300 hover:text-zinc-500 transition-colors flex-shrink-0"
            >
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

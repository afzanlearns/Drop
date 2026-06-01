import { CheckCircle, XCircle, Info, X } from "@phosphor-icons/react";
import { useRoomStore } from "../../store/roomStore";

export function ToastContainer() {
  const { toasts, removeToast } = useRoomStore();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 px-[16px] py-[10px] rounded-[8px] bg-text-primary text-bg font-body font-medium tracking-[-0.01em] text-[0.875rem] shadow-lg animate-toast-slide-up"
        >
          {toast.type === "success" && <CheckCircle size={16} className="text-brand flex-shrink-0" weight="fill" />}
          {toast.type === "error" && <XCircle size={16} className="text-accent-red flex-shrink-0" weight="fill" />}
          {toast.type === "info" && <Info size={16} className="text-accent-blue flex-shrink-0" weight="fill" />}
          <p className="flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 text-bg/50 hover:text-bg transition-colors flex-shrink-0 active:scale-95"
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      ))}
    </div>
  );
}

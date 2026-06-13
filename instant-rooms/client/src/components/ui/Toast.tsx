import { useRoomStore } from "../../store/roomStore";

export function ToastContainer() {
  const { toasts, removeToast } = useRoomStore();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-2.5"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            fontFamily: "'Geist Mono', monospace",
            fontSize: '0.8125rem',
          }}
        >
          <span style={{ color: toast.type === 'success' ? 'var(--success)' : toast.type === 'error' ? 'var(--error)' : 'var(--info)' }}>
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'i'}
          </span>
          <p className="flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            style={{ color: 'var(--text-secondary)' }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

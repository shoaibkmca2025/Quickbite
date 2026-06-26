import { useToasts } from '../store/toast';

export function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type === 'success' ? 'success' : ''}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

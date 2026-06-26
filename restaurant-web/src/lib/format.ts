export const inr = (n: number | undefined) =>
  `₹${(n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function countdown(etaAt?: string): string {
  if (!etaAt) return '--:--';
  const diff = new Date(etaAt).getTime() - Date.now();
  if (diff <= 0) return 'Delayed';
  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function clockTime(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const LABELS: Record<string, string> = {
  pending_payment: 'Pending payment',
  placed: 'New',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  assigned: 'Rider assigned',
  picked_up: 'Picked up',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

export const statusLabel = (s: string) => LABELS[s] ?? s;

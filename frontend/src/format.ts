export const inr = (n: number | undefined) =>
  `₹${(n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Awaiting payment',
  placed: 'Order placed',
  accepted: 'Accepted',
  preparing: 'Preparing your food',
  ready: 'Ready for pickup',
  assigned: 'Rider assigned',
  picked_up: 'Picked up',
  out_for_delivery: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};
export const statusLabel = (s: string) => STATUS_LABELS[s] ?? s;

const STATUS_STEPS = ['placed', 'accepted', 'preparing', 'ready', 'picked_up', 'out_for_delivery', 'delivered'];
export function statusProgress(status: string): number {
  const i = STATUS_STEPS.indexOf(status);
  if (i < 0) return 0;
  return Math.round(((i + 1) / STATUS_STEPS.length) * 100);
}

export function etaText(etaAt?: string): string {
  if (!etaAt) return '';
  const diff = new Date(etaAt).getTime() - Date.now();
  if (diff <= 0) return 'Any moment now';
  const mins = Math.ceil(diff / 60000);
  return `~${mins} min`;
}

export function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

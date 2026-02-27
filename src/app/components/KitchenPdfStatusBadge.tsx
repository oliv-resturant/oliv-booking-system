/**
 * Kitchen PDF Status Badge
 * Visual indicator showing the send status of a kitchen PDF.
 * States: Not sent (gray), Sent (green), Failed (red).
 */

import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { KitchenPdfService } from '@/services/kitchen-pdf.service';

interface KitchenPdfStatusBadgeProps {
  status: 'not_sent' | 'sent' | 'failed';
  lastSentAt?: string;
}

export function KitchenPdfStatusBadge({
  status,
  lastSentAt,
}: KitchenPdfStatusBadgeProps) {
  const config = {
    not_sent: {
      icon: Clock,
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      label: 'Not sent',
    },
    sent: {
      icon: CheckCircle2,
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: lastSentAt ? `Sent ${KitchenPdfService.formatTimestamp(lastSentAt)}` : 'Sent',
    },
    failed: {
      icon: XCircle,
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      label: 'Failed',
    },
  };

  const { icon: Icon, bg, text, border, label } = config[status];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${bg} ${text} ${border}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium" style={{ fontSize: 'var(--text-small)' }}>
        {label}
      </span>
    </div>
  );
}

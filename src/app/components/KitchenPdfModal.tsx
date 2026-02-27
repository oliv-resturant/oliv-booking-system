/**
 * Kitchen PDF Modal
 * Confirmation modal for sending booking PDFs to the kitchen.
 * Displays document details and warns about recent sends.
 */

import { FileText, Calendar, Users, Clock, Send, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface KitchenPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  booking: {
    id: number;
    customer: { name: string };
    event: { date: string; occasion: string };
    guests: number;
  };
  isSending: boolean;
  recentlySent?: boolean;  // For duplicate warning
}

export function KitchenPdfModal({
  isOpen,
  onClose,
  onConfirm,
  booking,
  isSending,
  recentlySent,
}: KitchenPdfModalProps) {
  const documentName = `Booking #${booking.id} – Kitchen Sheet`;

  const timestampPreview = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={FileText}
      title="Send PDF to Kitchen"
      maxWidth="md"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSending || recentlySent}
            className={`px-4 py-2 rounded-lg transition-opacity flex items-center gap-2 disabled:opacity-50 cursor-pointer ${
              recentlySent
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
          >
            <Send className="w-4 h-4" />
            {isSending ? 'Sending...' : recentlySent ? 'Recently Sent' : 'Confirm Send'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Warning if recently sent */}
        {recentlySent && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
            <div className="text-yellow-600 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Recently Sent Warning
              </p>
              <p className="text-sm text-yellow-700">
                This PDF was sent to the kitchen in the last 5 minutes.{' '}
                Please verify before sending again.
              </p>
            </div>
          </div>
        )}

        {/* Document Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              Document Name
            </span>
            <span className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>
              {documentName}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              Event Name
            </span>
            <span className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>
              {booking.event.occasion} – {booking.customer.name}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              Event Date
            </span>
            <span className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>
              {booking.event.date}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              Total Guests
            </span>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>
                {booking.guests}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              Timestamp
            </span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>
                {timestampPreview}
              </span>
            </div>
          </div>
        </div>

        {/* Info Message */}
        <p className="text-sm text-muted-foreground mt-4" style={{ fontSize: 'var(--text-small)' }}>
          This will send the kitchen sheet PDF to the kitchen email address.{' '}
          The send action will be logged for audit purposes.
        </p>
      </div>
    </Modal>
  );
}

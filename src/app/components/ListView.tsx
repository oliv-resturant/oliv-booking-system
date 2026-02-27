import { Mail, Calendar, Users, Phone, Clock } from 'lucide-react';
import { Button } from './Button';
import { KitchenPdfStatusBadge } from './KitchenPdfStatusBadge';
import type { KitchenPdfStatus } from '@/services/kitchen-pdf.service';

// Status color configuration (matching BookingsPage)
const statusColors: Record<string, { bg: string; text: string; border: string; dotColor: string }> = {
  'Confirmed': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dotColor: '#10b981' },
  'Touchbase': { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20', dotColor: '#9DAE91' },
  'New': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dotColor: '#8b5cf6' },
  'Declined': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dotColor: '#ef4444' },
  'Completed': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dotColor: '#3b82f6' },
};

interface ListViewProps {
  bookings: Array<{
    id: number;
    customer: {
      name: string;
      email: string;
      phone: string;
      avatar: string;
      avatarColor: string;
    };
    event: {
      date: string;
      time: string;
      occasion: string;
      location?: string;
    };
    guests: number;
    amount: string;
    status: string;
    contacted: {
      by: string;
      when: string;
    };
    kitchenPdf?: KitchenPdfStatus;
  }>;
  onOpenModal: (booking: any) => void;
}

export function ListView({ bookings, onOpenModal }: ListViewProps) {
  if (bookings.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <div className="text-muted-foreground mb-2">No bookings found</div>
        <div className="text-sm text-muted-foreground">Try adjusting your filters or search query</div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                Customer
              </th>
              <th className="px-4 py-3 text-left text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                Contact
              </th>
              <th className="px-4 py-3 text-left text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                Event
              </th>
              <th className="px-4 py-3 text-left text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                Status
              </th>
              <th className="px-4 py-3 text-left text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                Kitchen PDF
              </th>
              <th className="px-4 py-3 text-right text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                Amount
              </th>
              <th className="px-4 py-3 text-center text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-t border-border hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => onOpenModal(booking)}
              >
                {/* Customer Column */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{
                        backgroundColor: booking.customer.avatarColor,
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--font-weight-semibold)'
                      }}
                    >
                      {booking.customer.avatar}
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-foreground truncate"
                        style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
                      >
                        {booking.customer.name}
                      </div>
                      <div className="text-muted-foreground text-sm truncate">
                        {booking.event.occasion}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contact Column */}
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{booking.customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{booking.customer.phone}</span>
                    </div>
                  </div>
                </td>

                {/* Event Column */}
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                      <span>{booking.event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      <Users className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                      <span>{booking.guests} guests</span>
                    </div>
                    <div className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      By {booking.contacted.by} • {booking.contacted.when}
                    </div>
                    {booking.event.location && (
                      <div className="flex items-center gap-1.5 mt-1 text-primary font-medium" style={{ fontSize: 'var(--text-small)' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {booking.event.location}
                      </div>
                    )}
                  </div>
                </td>

                {/* Status Column */}
                <td className="px-4 py-3">
                  <span
                    className={`px-2.5 py-1 rounded-lg border inline-flex items-center gap-1.5 ${statusColors[booking.status]?.bg || ''
                      } ${statusColors[booking.status]?.text || ''} ${statusColors[booking.status]?.border || ''
                      }`}
                    style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: statusColors[booking.status]?.dotColor }}
                    />
                    {booking.status}
                  </span>
                </td>

                {/* Kitchen PDF Column */}
                <td className="px-4 py-3">
                  {booking.kitchenPdf ? (
                    <KitchenPdfStatusBadge
                      status={booking.kitchenPdf.sentStatus}
                      lastSentAt={booking.kitchenPdf.lastSentAt}
                    />
                  ) : (
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      -
                    </span>
                  )}
                </td>

                {/* Amount Column */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span
                      className="text-foreground"
                      style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
                    >
                      {booking.amount}
                    </span>
                  </div>
                </td>

                {/* Actions Column */}
                <td className="px-4 py-3 text-center">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenModal(booking);
                    }}
                    className="min-h-[32px] h-8 text-xs px-3"
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-muted px-4 py-3 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Showing {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
        </div>
      </div>
    </div>
  );
}

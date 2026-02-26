import { Mail, Calendar, Users, Phone, Clock } from 'lucide-react';

// Status color configuration (matching BookingsPage)
const statusColors: Record<string, { bg: string; text: string; border: string; dotColor: string }> = {
  'Confirmed': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dotColor: '#10b981' },
  'Touchbase': { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20', dotColor: '#9DAE91' },
  'New': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dotColor: '#8b5cf6' },
  'Declined': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dotColor: '#ef4444' },
  'Completed': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dotColor: '#3b82f6' },
};

interface GridViewProps {
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
      occasion: string;
    };
    guests: number;
    amount: string;
    status: string;
    contacted: {
      by: string;
      when: string;
    };
  }>;
  onOpenModal: (booking: any) => void;
}

export function GridView({ onOpenModal, bookings }: GridViewProps) {
  if (bookings.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <div className="text-muted-foreground mb-2">No bookings found</div>
        <div className="text-sm text-muted-foreground">Try adjusting your filters or search query</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-card border border-border rounded-xl p-4 md:p-5 hover:shadow-md transition-all"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
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
              <div>
                <h4
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  {booking.customer.name}
                </h4>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  {booking.event.occasion}
                </p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                statusColors[booking.status]?.bg
              } ${statusColors[booking.status]?.text} ${
                statusColors[booking.status]?.border
              }`}
              style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: statusColors[booking.status]?.dotColor }}
              />
              {booking.status}
            </span>
          </div>

          {/* Refined Information Rows */}
          <div className="space-y-2 mb-4">
            {/* Row 1: Email + Date */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground truncate" style={{ fontSize: 'var(--text-small)' }}>
                  {booking.customer.email}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  {booking.event.date}
                </span>
              </div>
            </div>

            {/* Row 2: Phone + Guests */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  {booking.customer.phone}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  {booking.guests} guests
                </span>
              </div>
            </div>

            {/* Row 3: Contacted + Amount */}
            <div className="flex items-center justify-between gap-4">
              <div className="text-muted-foreground flex-1" style={{ fontSize: 'var(--text-small)' }}>
                By {booking.contacted.by} • {booking.contacted.when}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  {booking.amount}
                </span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => onOpenModal(booking)}
            className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-secondary hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
          >
            View Details
          </button>
        </div>
      ))}
    </div>
  );
}

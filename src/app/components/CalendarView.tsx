import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Users, Clock } from 'lucide-react';
import { Button } from './Button';
import { cn } from './ui/utils';

// Date utilities
const parseEventDate = (dateStr: string): Date => {
  // Parse dates like "Jun 15, 2026" or "Mar 20, 2026"
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };

  const parts = dateStr.split(' ');
  if (parts.length >= 3) {
    const month = months[parts[0]] ?? 0;
    const day = parseInt(parts[1].replace(',', ''), 10);
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date();
};

const formatDateKey = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const formatMonthYear = (date: Date): string => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

// Status colors (matching other views)
const statusColors: Record<string, string> = {
  'Confirmed': '#10b981',
  'Touchbase': '#9DAE91',
  'New': '#8b5cf6',
  'Declined': '#ef4444',
  'Completed': '#3b82f6',
};

interface CalendarViewProps {
  bookings: Array<{
    id: number;
    customer: {
      name: string;
      avatar: string;
      avatarColor: string;
    };
    event: {
      date: string;
      time: string;
      occasion: string;
    };
    guests: number;
    amount: string;
    status: string;
  }>;
  onOpenModal: (booking: any) => void;
}

export function CalendarView({ bookings, onOpenModal }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const grouped = new Map<string, typeof bookings>();
    bookings.forEach(booking => {
      const bookingDate = parseEventDate(booking.event.date);
      const dateKey = formatDateKey(bookingDate);
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(booking);
    });
    return grouped;
  }, [bookings]);

  // Get upcoming bookings (next 5, sorted by date)
  const upcomingBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings
      .map(b => ({ ...b, parsedDate: parseEventDate(b.event.date) }))
      .filter(b => b.parsedDate >= today)
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())
      .slice(0, 5)
      .map(({ parsedDate, ...rest }) => rest);
  }, [bookings]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDay = firstDayOfMonth.getDay(); // 0 = Sunday
    const totalDays = lastDayOfMonth.getDate();

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      days.push({
        date: new Date(year, month - 1, day),
        isCurrentMonth: false
      });
    }

    // Add days from current month
    for (let day = 1; day <= totalDays; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }

    // Add days from next month to complete the grid (42 cells = 6 rows x 7 days)
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentMonth]);

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date): typeof bookings => {
    const dateKey = formatDateKey(date);
    return bookingsByDate.get(dateKey) || [];
  };

  // Navigate months
  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Calendar - 3 columns */}
      <div className="lg:col-span-3 bg-card border border-border rounded-xl p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {formatMonthYear(currentMonth)}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(-1)}
              className="min-h-[32px] px-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(1)}
              className="min-h-[32px] px-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(({ date, isCurrentMonth }, index) => {
            const dayBookings = getBookingsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={cn(
                  "min-h-24 p-1 border border-border rounded hover:bg-accent/50 transition-colors cursor-pointer",
                  !isCurrentMonth && "bg-muted/30 opacity-60",
                  isToday && "ring-2 ring-primary/20"
                )}
                onClick={() => {
                  // Handle date click - could show a modal with all bookings for that day
                  if (dayBookings.length > 0 && dayBookings.length === 1) {
                    onOpenModal(dayBookings[0]);
                  }
                }}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isToday ? "text-primary" : "text-foreground"
                )}>
                  {date.getDate()}
                </div>

                {/* Booking chips */}
                <div className="space-y-0.5">
                  {dayBookings.slice(0, 3).map(booking => (
                    <div
                      key={booking.id}
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity",
                        "border"
                      )}
                      style={{
                        backgroundColor: `${statusColors[booking.status] || '#9DAE91'}20`,
                        borderColor: statusColors[booking.status] || '#9DAE91',
                        color: statusColors[booking.status] || '#9DAE91'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenModal(booking);
                      }}
                      title={`${booking.customer.name} - ${booking.event.occasion}`}
                    >
                      {booking.customer.name}
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1.5 py-0.5">
                      +{dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Bookings Sidebar - 1 column */}
      <div className="lg:col-span-1">
        <div className="bg-card border border-border rounded-xl p-4 sticky top-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Upcoming Bookings
          </h3>

          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground text-sm">No upcoming bookings</div>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map(booking => (
                <div
                  key={booking.id}
                  className="p-3 bg-background border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => onOpenModal(booking)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                      style={{ backgroundColor: booking.customer.avatarColor }}
                    >
                      {booking.customer.avatar}
                    </div>
                    <div className="text-sm font-medium text-foreground truncate">
                      {booking.customer.name}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      <div className="w-3 h-3 flex-shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </div>
                      <span className="truncate">{booking.event.date}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>{booking.event.time}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      <Users className="w-3 h-3 flex-shrink-0" />
                      <span>{booking.guests} guests</span>
                      <span>•</span>
                      <span className="font-medium text-foreground">{booking.amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

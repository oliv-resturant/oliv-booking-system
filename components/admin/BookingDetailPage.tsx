'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, User, CalendarDays, Edit, UtensilsCrossed, MessageSquare, Mail, Lock, Unlock, History, ChevronDown, ChevronUp } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';

interface Booking {
  id: string;
  customer: {
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
    avatarColor: string;
    address: string;
  };
  event: {
    date: string;
    time: string;
    occasion: string;
  };
  guests: number;
  amount: string;
  status: string;
  contacted: {
    by: string;
    when: string;
  };
  booking: string;
  allergies: string;
  notes: string;
  menuItems: Array<{
    item: string;
    category: string;
    quantity: string;
    price: string;
  }>;
  contactHistory: Array<{
    by: string;
    time: string;
    date: string;
    action: string;
  }>;
  isLocked?: boolean;
  editSecret?: string;
}

interface AuditLog {
  id: string;
  booking_id: string;
  admin_user_id: string | null;
  actor_type: 'admin' | 'client';
  actor_label: string;
  changes: Array<{
    field: string;
    from: any;
    to: any;
  }>;
  ip_address: string | null;
  created_at: string;
  admin_name?: string | null;
  admin_email?: string | null;
  admin_role?: string | null;
}

interface BookingDetailPageProps {
  bookingId: string;
}

export function BookingDetailPage({ bookingId }: BookingDetailPageProps) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Array<{ by: string; time: string; date: string; action: string }>>([]);
  const [newComment, setNewComment] = useState('');
  const [localStatus, setLocalStatus] = useState('');
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);
  const [showAuditHistory, setShowAuditHistory] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [editLink, setEditLink] = useState<string | null>(null);

  // Fetch booking data
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (response.ok) {
          const data = await response.json();
          setBooking(data);
          setComments(data.contactHistory || []);
          setLocalStatus(data.status || 'pending');
          setAllergies(data.allergies || '');
          setNotes(data.notes || '');
          setIsLocked(data.isLocked || false);
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // Fetch audit history when shown
  useEffect(() => {
    if (showAuditHistory) {
      fetchAuditHistory();
    }
  }, [showAuditHistory, bookingId]);

  const fetchAuditHistory = async () => {
    setAuditLoading(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/audit`);
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching audit history:', error);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleToggleLock = async () => {
    setLockLoading(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isLocked ? 'unlock' : 'lock' }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLocked(!isLocked);
        // Refresh audit history if it's shown
        if (showAuditHistory) {
          fetchAuditHistory();
        }
      }
    } catch (error) {
      console.error('Error toggling lock:', error);
    } finally {
      setLockLoading(false);
    }
  };

  const handleCopyEditLink = async () => {
    if (!booking?.editSecret) {
      // Try to get the edit secret
      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.editSecret) {
            const baseUrl = window.location.origin;
            const editLink = `${baseUrl}/booking/${bookingId}/edit/${data.editSecret}`;
            setEditLink(editLink);
            await navigator.clipboard.writeText(editLink);
            alert('Edit link copied to clipboard!');
          }
        }
      } catch (error) {
        console.error('Error getting edit link:', error);
      }
      return;
    }

    const baseUrl = window.location.origin;
    const editLink = `${baseUrl}/booking/${bookingId}/edit/${booking.editSecret}`;
    await navigator.clipboard.writeText(editLink);
    alert('Edit link copied to clipboard!');
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'declined', label: 'Declined' },
    { value: 'no_show', label: 'No Show' },
  ];

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newCommentObj = {
      by: 'Admin',
      time: timeStr,
      date: dateStr,
      action: newComment
    };

    setComments([...comments, newCommentObj]);
    setNewComment('');
  };

  const handleStatusChange = async (value: string) => {
    setLocalStatus(value);
    try {
      const response = await fetch('/api/bookings/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: value }),
      });
      if (response.ok) {
        setBooking(booking ? { ...booking, status: value } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const allergyDetails = allergies
        ? allergies.split(',').map((a: string) => a.trim()).filter((a: string) => a.length > 0)
        : [];

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          allergyDetails,
          specialRequests: notes,
        }),
      });

      if (response.ok) {
        router.push('/admin/bookings');
      }
    } catch (error) {
      console.error('Error saving booking changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background px-8 pt-6 pb-1 flex flex-col">
        <div className="text-center py-16">
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
            Loading booking details...
          </p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-full bg-background px-8 pt-6 pb-1 flex flex-col">
        <div className="text-center py-16">
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
            Booking not found
          </p>
          <button
            onClick={() => router.push('/admin/bookings')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 pt-3 pb-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/bookings')}
            className="p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer flex items-center gap-2 text-foreground"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Bookings</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          {/* Lock/Unlock Button */}
          <button
            onClick={handleToggleLock}
            disabled={lockLoading}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              isLocked
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-secondary hover:bg-primary text-white'
            }`}
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
            title={isLocked ? 'Unlock booking (allows client edits)' : 'Lock booking (prevents client edits)'}
          >
            {lockLoading ? (
              'Loading...'
            ) : isLocked ? (
              <>
                <Unlock className="w-4 h-4" />
                Unlock
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Lock
              </>
            )}
          </button>

          {/* Audit History Toggle */}
          <button
            onClick={() => setShowAuditHistory(!showAuditHistory)}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition-colors flex items-center gap-2 cursor-pointer"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
          >
            <History className="w-4 h-4" />
            {showAuditHistory ? 'Hide History' : 'Show History'}
          </button>

          {/* Copy Edit Link Button */}
          <button
            onClick={handleCopyEditLink}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition-colors flex items-center gap-2 cursor-pointer"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
            title="Copy client edit link to clipboard"
          >
            <Send className="w-4 h-4" />
            Copy Edit Link
          </button>
        </div>
      </div>

      {/* Lock Status Banner */}
      {isLocked && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-100">Booking is Locked</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">Clients cannot edit this booking. You can still make changes as an admin.</p>
          </div>
        </div>
      )}

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-foreground" style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-semibold)' }}>
          Booking Details
        </h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-base)' }}>
          View and manage booking information
        </p>
      </div>

      <div className="space-y-6">
        {/* Customer Information */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
            <User className="w-5 h-5 text-primary" />
            Customer Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                First Name
              </label>
              <input
                type="text"
                value={booking.customer.firstName}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Last Name
              </label>
              <input
                type="text"
                value={booking.customer.lastName}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Email
              </label>
              <input
                type="email"
                value={booking.customer.email}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={booking.customer.phone}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Address
              </label>
              <input
                type="text"
                value={booking.customer.address}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
              <CalendarDays className="w-5 h-5 text-primary" />
              Event Details
            </h3>
            <button className="text-foreground hover:bg-accent px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Event Date
              </label>
              <input
                type="text"
                value={booking.event.date}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Time
              </label>
              <input
                type="text"
                value={booking.event.time}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Guests
              </label>
              <input
                type="text"
                value={booking.guests}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Occasion
              </label>
              <input
                type="text"
                value={booking.event.occasion}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Amount (CHF)
              </label>
              <input
                type="text"
                value={booking.amount}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Status
              </label>
              <StatusDropdown
                options={statusOptions}
                value={localStatus}
                onChange={handleStatusChange}
                placeholder="Select status"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
            <MessageSquare className="w-5 h-5 text-primary" />
            Additional Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Allergies
              </label>
              <textarea
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ fontSize: 'var(--text-base)' }}
                placeholder="Enter allergies separated by commas..."
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ fontSize: 'var(--text-base)' }}
                placeholder="Enter special requests or notes..."
              />
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            Menu Items
          </h3>
          <div className="bg-background border border-border rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>Item</th>
                  <th className="px-4 py-3 text-left text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>Category</th>
                  <th className="px-4 py-3 text-left text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>Quantity</th>
                  <th className="px-4 py-3 text-right text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {booking.menuItems && booking.menuItems.length > 0 ? (
                  booking.menuItems.map((item, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-base)' }}>{item.item}</td>
                      <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>{item.category}</td>
                      <td className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-base)' }}>{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>{item.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                      No items selected for this booking
                    </td>
                  </tr>
                )}
                {booking.menuItems && booking.menuItems.length > 0 && (
                  <tr className="border-t-2 border-border bg-muted">
                    <td colSpan={3} className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>Total Amount</td>
                    <td className="px-4 py-3 text-right text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>{booking.amount}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact History */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
            <MessageSquare className="w-5 h-5 text-primary" />
            Comments
          </h3>
          <div className="space-y-3">
            {comments.map((contact, index) => (
              <div key={index} className="bg-background border border-border rounded-lg p-4 flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ backgroundColor: '#9DAE91', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  {contact.by.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {contact.by}
                    </span>
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      • {contact.time} • {contact.date}
                    </span>
                  </div>
                  <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                    {contact.action}
                  </p>
                </div>
              </div>
            ))}

            {/* Add Comment Form */}
            <div className="space-y-3 pt-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{ fontSize: 'var(--text-base)' }}
              />
              <button
                onClick={handleAddComment}
                className="w-full px-4 py-3 bg-secondary text-white rounded-lg hover:bg-primary transition-colors flex items-center justify-center gap-2 cursor-pointer"
                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
              >
                <Mail className="w-4 h-4" />
                Add Comment
              </button>
            </div>
          </div>
        </div>

        {/* Audit History Section */}
        {showAuditHistory && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
              <History className="w-5 h-5 text-primary" />
              Audit History
            </h3>

            {auditLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading audit history...
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No changes recorded yet
              </div>
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="bg-background border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                            log.actor_type === 'admin' ? 'bg-primary' : 'bg-secondary'
                          }`}
                          style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}
                        >
                          {log.actor_label.charAt(0)}
                        </div>
                        <div>
                          <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>
                            {log.actor_label}
                          </p>
                          {log.admin_name && (
                            <p className="text-muted-foreground text-sm">{log.admin_email}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {log.changes.map((change, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">
                            {change.field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                          </span>
                          <span className={`line-through ${change.from ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {change.from === null || change.from === undefined ? 'None' : String(change.from)}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-green-500 font-medium">
                            {change.to === null || change.to === undefined ? 'None' : String(change.to)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {log.ip_address && (
                      <p className="text-xs text-muted-foreground mt-2">
                        IP: {log.ip_address}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        <div className="pb-4">
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Copyright Footer */}
        <div className="text-center pt-4 pb-1">
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
            © 2026 Restaurant Oliv Restaurant & Bar
          </p>
        </div>
      </div>
    </div>
  );
}

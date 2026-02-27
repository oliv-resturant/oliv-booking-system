import { useState } from 'react';
import { ArrowLeft, Send, User, CalendarDays, Edit, UtensilsCrossed, MessageSquare, Mail, FileText, Lock, Unlock, History } from 'lucide-react';
import { KitchenPdfStatusBadge } from './KitchenPdfStatusBadge';
import { KitchenPdfActionModal } from './KitchenPdfActionModal';
import { KitchenPdfService, type KitchenPdfStatus } from '../../services/kitchen-pdf.service';
import { VenueService } from '../../services/venue.service';
import { toast } from 'sonner';

interface Booking {
  id: number;
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
    location?: string;
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
  kitchenPdf?: KitchenPdfStatus;
}

interface BookingDetailPageProps {
  booking: Booking;
  onBack: () => void;
}

export function BookingDetailPage({ booking, onBack }: BookingDetailPageProps) {
  const [currentBooking, setCurrentBooking] = useState(booking);
  const [comments, setComments] = useState<Array<{ by: string; time: string; date: string; action: string }>>(
    booking.contactHistory || []
  );
  const [newComment, setNewComment] = useState('');

  // Kitchen PDF state
  const [kitchenPdfStatus, setKitchenPdfStatus] = useState<KitchenPdfStatus | undefined>(
    booking.kitchenPdf
  );
  const [isPdfActionModalOpen, setIsPdfActionModalOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  // Admin users list for kitchen PDF modal
  const adminUsers = [
    { id: '1', name: 'Chef Manager', email: 'chef@oliv.com', role: 'Kitchen Manager' },
    { id: '2', name: 'Sous Chef', email: 'sous@oliv.com', role: 'Sous Chef' },
    { id: '3', name: 'Kitchen Staff', email: 'kitchen@oliv.com', role: 'Kitchen Staff' },
  ];

  const VENUE_LOCATIONS = VenueService.getLocations();

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty', {
        description: 'Please enter a comment before adding.',
      });
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newCommentObj = {
      by: 'Admin', // You can replace this with actual logged-in user name
      time: timeStr,
      date: dateStr,
      action: newComment
    };

    setComments([...comments, newCommentObj]);
    setNewComment('');

    toast.success('Comment added successfully', {
      description: 'Your comment has been recorded.',
    });
  };



  const handleSaveChanges = () => {
    // In a real app, this would persist to the server
    toast.success('Changes saved successfully', {
      description: 'Booking details have been updated.',
    });
  };

  const handleLocationChange = (newLocation: string) => {
    setCurrentBooking(prev => ({
      ...prev,
      event: {
        ...prev.event,
        location: newLocation
      }
    }));
    toast.success('Location updated visually. Save changes to persist.');
  };

  const handlePdfActionComplete = (action: 'admin' | 'external' | 'download', data?: { emails?: string[]; notes?: string }) => {
    const documentName = KitchenPdfService.getDocumentName(booking.id);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    let actionText = '';
    if (action === 'download') {
      actionText = `Downloaded kitchen sheet PDF: ${documentName}`;
    } else if (action === 'admin') {
      const recipientCount = data?.emails?.length || 0;
      const recipients = data?.emails?.join(', ') || '';
      actionText = `Kitchen sheet PDF sent to ${recipientCount} admin user${recipientCount !== 1 ? 's' : ''}: ${documentName}`;
      if (data?.notes) {
        actionText += `\nNotes: ${data.notes}`;
      }
      if (recipients) {
        actionText += `\nRecipients: ${recipients}`;
      }
      setKitchenPdfStatus({
        documentName,
        sentStatus: 'sent',
        lastSentAt: now.toISOString(),
        sentBy: 'Admin',
        sendAttempts: (kitchenPdfStatus?.sendAttempts || 0) + 1,
      });
    } else if (action === 'external' && data?.emails) {
      const email = data.emails[0];
      actionText = `Kitchen sheet PDF sent to ${email}: ${documentName}`;
      if (data?.notes) {
        actionText += `\nNotes: ${data.notes}`;
      }
      setKitchenPdfStatus({
        documentName,
        sentStatus: 'sent',
        lastSentAt: now.toISOString(),
        sentBy: 'Admin',
        sendAttempts: (kitchenPdfStatus?.sendAttempts || 0) + 1,
      });
    }

    const newCommentObj = {
      by: 'Admin',
      time: timeStr,
      date: dateStr,
      action: actionText,
    };
    setComments([...comments, newCommentObj]);

    toast.success('Action completed successfully', {
      description: actionText.split('\n')[0],
    });
  };

  return (
    <div className="px-4 md:px-8 pt-3 pb-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer flex items-center gap-2 text-foreground"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Bookings</span>
          </button>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Kitchen PDF Status Badge */}
          {kitchenPdfStatus && (
            <KitchenPdfStatusBadge
              status={kitchenPdfStatus.sentStatus}
              lastSentAt={kitchenPdfStatus.lastSentAt}
            />
          )}

          {/* Kitchen Sheet Action Button */}
          <button
            onClick={() => setIsPdfActionModalOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
          >
            <FileText className="w-4 h-4" />
            Kitchen Sheet
          </button>

          {/* Action Buttons */}
          <button
            onClick={() => setIsLocked(!isLocked)}
            className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition-colors flex items-center gap-2 cursor-pointer"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
          >
            {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {isLocked ? 'Unlock' : 'Lock'}
          </button>
          <button
            className="px-4 py-2 bg-[#1F2937] text-white rounded-lg hover:bg-[#374151] transition-colors flex items-center gap-2 cursor-pointer"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
          >
            <History className="w-4 h-4" />
            Show History
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Link copied');
            }}
            className="px-4 py-2 bg-[#1F2937] text-white rounded-lg hover:bg-[#374151] transition-colors flex items-center gap-2 cursor-pointer"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
          >
            <Send className="w-4 h-4" />
            Copy Edit Link
          </button>
        </div>
      </div>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-foreground" style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-semibold)' }}>
          Booking Details
        </h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-base)' }}>
          View and manage booking information
        </p>
      </div>

      {isLocked && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4 flex items-start gap-3 mb-6">
          <Lock className="w-5 h-5 text-[#D97706] mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-[#92400E]" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
              Booking is Locked
            </h4>
            <p className="text-[#B45309]" style={{ fontSize: 'var(--text-small)' }}>
              Clients cannot edit this booking. You can still make changes as an admin.
            </p>
          </div>
        </div>
      )}

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
                value={currentBooking.customer.firstName}
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
                value={currentBooking.customer.lastName}
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
                value={currentBooking.customer.email}
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
                value={currentBooking.customer.phone}
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
                value={currentBooking.customer.address}
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
                value={currentBooking.event.date}
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
                value={currentBooking.event.time}
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
                value={currentBooking.guests}
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
                value={currentBooking.event.occasion}
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
                value={currentBooking.amount}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Venue Location
              </label>
              <select
                value={currentBooking.event.location || ''}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground cursor-pointer"
                style={{ fontSize: 'var(--text-base)' }}
              >
                <option value="">Not Assigned</option>
                {VENUE_LOCATIONS.map((loc: string) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Status
              </label>
              <input
                type="text"
                value={currentBooking.status}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
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
                value={currentBooking.allergies}
                readOnly
                rows={2}
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground resize-none"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Notes
              </label>
              <textarea
                value={currentBooking.notes}
                readOnly
                rows={2}
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground resize-none"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
          </div>
        </div>

        {/* Menu Items */}
        {booking.menuItems.length > 0 && (
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
                  {booking.menuItems.map((item, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-base)' }}>{item.item}</td>
                      <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>{item.category}</td>
                      <td className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-base)' }}>{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>{item.price}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-muted">
                    <td colSpan={3} className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>Total Amount</td>
                    <td className="px-4 py-3 text-right text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>{currentBooking.amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

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

        {/* Save Button */}
        <div className="pb-4">
          <button
            onClick={handleSaveChanges}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            Save Changes
          </button>
        </div>

        {/* Copyright Footer */}
        <div className="text-center pt-4 pb-1">
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
            © 2026 Restaurant Oliv Restaurant & Bar
          </p>
        </div>
      </div>

      {/* Kitchen PDF Action Modal */}
      <KitchenPdfActionModal
        isOpen={isPdfActionModalOpen}
        onClose={() => setIsPdfActionModalOpen(false)}
        onActionComplete={handlePdfActionComplete}
        adminUsers={adminUsers}
        booking={booking}
      />
    </div>
  );
}
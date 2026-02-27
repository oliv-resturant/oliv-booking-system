import { useState } from 'react';
import { Mail, Download, Users, X, Loader2, CheckSquare, MessageSquare, ChevronLeft, ArrowRight, Send, ReceiptText } from 'lucide-react';
import { cn } from './ui/utils';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface KitchenPdfActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionComplete: (action: 'admin' | 'external' | 'download', data?: { emails?: string[]; notes?: string }) => void;
  adminUsers?: AdminUser[];
  booking: {
    id: number;
    customer: {
      name: string;
    };
    event: {
      date: string;
      time: string;
      occasion: string;
      location?: string;
    };
    guests: number;
    menuItems: Array<{
      item: string;
      category: string;
      quantity: string;
      price: string;
    }>;
    allergies: string;
    notes: string;
  };
}

type Action = 'admin' | 'external' | 'download' | null;

// Default admin users if none provided
const DEFAULT_ADMIN_USERS: AdminUser[] = [
  { id: '1', name: 'Chef Manager', email: 'chef@oliv.com', role: 'Kitchen Manager' },
  { id: '2', name: 'Sous Chef', email: 'sous@oliv.com', role: 'Sous Chef' },
  { id: '3', name: 'Kitchen Staff', email: 'kitchen@oliv.com', role: 'Kitchen Staff' },
];

export function KitchenPdfActionModal({ isOpen, onClose, onActionComplete, adminUsers = DEFAULT_ADMIN_USERS, booking }: KitchenPdfActionModalProps) {
  const [selectedAction, setSelectedAction] = useState<Action>(null);
  const [externalEmail, setExternalEmail] = useState('');
  const [selectedAdminUsers, setSelectedAdminUsers] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const documentName = `Booking #${booking.id} – Kitchen Sheet`;

  const handleActionSelect = (action: Action) => {
    setSelectedAction(action);
    setExternalEmail('');
    setSelectedAdminUsers(new Set());
    setNotes('');
  };

  const handleCancel = () => {
    setSelectedAction(null);
    setExternalEmail('');
    setSelectedAdminUsers(new Set());
    setNotes('');
  };

  const toggleAdminUser = (userId: string) => {
    const newSelection = new Set(selectedAdminUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedAdminUsers(newSelection);
  };

  const selectAllAdminUsers = () => {
    if (selectedAdminUsers.size === adminUsers.length) {
      setSelectedAdminUsers(new Set());
    } else {
      setSelectedAdminUsers(new Set(adminUsers.map(u => u.id)));
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);

    try {
      // Generate PDF content (placeholder)
      const pdfContent = `
KITCHEN SHEET - ${documentName}
=====================================

CUSTOMER: ${booking.customer.name}

EVENT DETAILS
==============
Date: ${booking.event.date}
Time: ${booking.event.time}
Occasion: ${booking.event.occasion}
Guests: ${booking.guests}

MENU ITEMS
===========
${booking.menuItems.map(item => `${item.item} (${item.category}) - ${item.quantity} - ${item.price}`).join('\n')}

ALLERGIES & DIETARY NOTES
==========================
${booking.allergies || 'None specified'}

ADDITIONAL NOTES
================
${booking.notes || 'None'}

${notes ? `\nSENDER NOTES:\n${notes}\n` : ''}

Generated: ${new Date().toLocaleString()}
      `.trim();

      if (selectedAction === 'download') {
        const blob = new Blob([pdfContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${documentName}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        onActionComplete('download');
        setTimeout(() => {
          handleCancel();
          onClose();
        }, 500);
      } else if (selectedAction === 'admin') {
        if (selectedAdminUsers.size === 0) {
          alert('Please select at least one admin user');
          setIsProcessing(false);
          return;
        }
        const selectedEmails = adminUsers
          .filter(u => selectedAdminUsers.has(u.id))
          .map(u => u.email);
        onActionComplete('admin', { emails: selectedEmails, notes });
        setTimeout(() => {
          handleCancel();
          onClose();
        }, 500);
      } else if (selectedAction === 'external') {
        if (!externalEmail.trim()) {
          alert('Please enter an email address');
          setIsProcessing(false);
          return;
        }
        onActionComplete('external', { emails: [externalEmail], notes });
        setTimeout(() => {
          handleCancel();
          onClose();
        }, 500);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] w-full max-w-[800px] overflow-hidden relative flex flex-col max-h-[90vh]">

          <div className="px-6 py-5 border-b border-border/50 bg-muted/20 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-foreground tracking-tight" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                Kitchen Sheet Routing
              </h2>
              <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                {documentName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 w-9 h-9 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            {!selectedAction ? (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm mb-2 font-medium">
                  Select destination for this document:
                </p>

                <button
                  onClick={() => handleActionSelect('admin')}
                  className="w-full p-4 bg-background border border-border/60 rounded-xl hover:border-primary/50 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer flex items-center gap-4 text-left group"
                  disabled={isProcessing}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-primary/15 transition-all duration-200 text-primary">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-foreground font-semibold mb-0.5">Kitchen Staff</div>
                    <div className="text-muted-foreground text-sm">Send to internal team members</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </button>

                <button
                  onClick={() => handleActionSelect('external')}
                  className="w-full p-4 bg-background border border-border/60 rounded-xl hover:border-purple-500/50 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer flex items-center gap-4 text-left group"
                  disabled={isProcessing}
                >
                  <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-all duration-200 text-purple-600 dark:text-purple-400">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-foreground font-semibold mb-0.5">External User</div>
                    <div className="text-muted-foreground text-sm">Send to a specific email address</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </button>

                <button
                  onClick={() => handleActionSelect('download')}
                  className="w-full p-4 bg-background border border-border/60 rounded-xl hover:border-emerald-500/50 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer flex items-center gap-4 text-left group"
                  disabled={isProcessing}
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-all duration-200 text-emerald-600 dark:text-emerald-400">
                    <Download className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-foreground font-semibold mb-0.5">Download PDF</div>
                    <div className="text-muted-foreground text-sm">Save directly to your system</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </button>
              </div>
            ) : (
              <div className="space-y-5 animate-in slide-in-from-right-4 duration-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancel}
                    className="p-1.5 -ml-1.5 hover:bg-accent rounded-lg transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                    disabled={isProcessing}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="font-semibold text-foreground" style={{ fontSize: 'var(--text-h4)' }}>
                    {selectedAction === 'admin' && 'Send to Kitchen Staff'}
                    {selectedAction === 'external' && 'Send to External User'}
                    {selectedAction === 'download' && 'Download PDF'}
                  </div>
                </div>

                <div>
                  {selectedAction === 'admin' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-foreground">Recipients</label>
                        <button
                          onClick={selectAllAdminUsers}
                          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          {selectedAdminUsers.size === adminUsers.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>

                      <div className="space-y-2 border border-border/50 rounded-xl p-1.5 bg-muted/20 max-h-[180px] overflow-y-auto">
                        {adminUsers.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => toggleAdminUser(user.id)}
                            className={cn(
                              "w-full px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 cursor-pointer group text-left",
                              selectedAdminUsers.has(user.id) ? "bg-background shadow-sm border border-border" : "hover:bg-black/5 dark:hover:bg-white/5 border border-transparent"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors",
                              selectedAdminUsers.has(user.id) ? "bg-primary text-primary-foreground" : "border border-muted-foreground/30 text-transparent group-hover:border-muted-foreground/50"
                            )}>
                              <CheckSquare className="w-3.5 h-3.5 opacity-100" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={cn("text-sm transition-colors truncate", selectedAdminUsers.has(user.id) ? "text-foreground font-medium" : "text-muted-foreground")}>{user.name}</div>
                              <div className="text-muted-foreground/70 text-xs truncate">{user.email}</div>
                            </div>
                            <div className="text-[11px] font-medium text-muted-foreground bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {user.role}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedAction === 'external' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Recipient Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="email"
                          placeholder="kitchen@example.com"
                          value={externalEmail}
                          onChange={(e) => setExternalEmail(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-background border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                          autoFocus
                        />
                      </div>
                    </div>
                  )}

                  {selectedAction === 'download' && (
                    <div className="py-2">
                      <div className="w-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4 flex items-center justify-center text-emerald-700 dark:text-emerald-400 gap-2">
                        <Download className="w-5 h-5" />
                        <span className="font-medium text-sm">Ready to save locally</span>
                      </div>
                    </div>
                  )}
                </div>

                {(selectedAction === 'admin' || selectedAction === 'external') && (
                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">Sender Notes</span>
                      <span className="text-muted-foreground/70 text-xs">Optional</span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/70" />
                      <textarea
                        placeholder="Add special instructions for the kitchen..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        className="w-full pl-9 pr-4 py-2.5 bg-background border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="bg-muted/30 border border-border/50 rounded-xl p-4 space-y-3 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                    <ReceiptText className="w-32 h-32" />
                  </div>

                  <div className="flex justify-between items-center text-sm relative z-10 border-b border-border/50 pb-2">
                    <span className="text-muted-foreground font-medium">Customer</span>
                    <span className="text-foreground font-semibold">{booking.customer.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 relative z-10">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Event</span>
                      <div className="text-sm text-foreground font-medium">{booking.event.occasion}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Guests</span>
                      <div className="text-sm text-foreground font-medium">{booking.guests}</div>
                    </div>
                    <div className="space-y-1 col-span-2 pt-1 border-t border-border/20">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Location</span>
                      <div className="text-sm text-primary font-bold">{booking.event.location || 'Not Assigned'}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleConfirm}
                    disabled={isProcessing || (selectedAction === 'external' && !externalEmail.trim()) || (selectedAction === 'admin' && selectedAdminUsers.size === 0)}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer text-sm font-semibold flex items-center justify-center gap-2 shadow-sm border border-transparent",
                      selectedAction === 'download'
                        ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-600/20 hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-none"
                        : "bg-primary text-primary-foreground hover:bg-primary/95 hover:shadow-primary/25 hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-none"
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {selectedAction === 'admin' && <><Send className="w-4 h-4" /> Send to Team</>}
                        {selectedAction === 'external' && <><Send className="w-4 h-4" /> Send Email</>}
                        {selectedAction === 'download' && <><Download className="w-4 h-4" /> Download PDF</>}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

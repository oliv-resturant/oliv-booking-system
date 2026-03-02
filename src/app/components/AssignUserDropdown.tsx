import { useState, useEffect, useRef } from 'react';
import { User, Check, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { UserService, type SystemUser } from '../../services/user.service';

interface AssignUserDropdownProps {
  bookingId: number;
  currentAssignedTo?: string;
  onAssign: (userName: string) => void;
  disabled?: boolean;
}

export function AssignUserDropdown({
  bookingId,
  currentAssignedTo,
  onAssign,
  disabled = false,
}: AssignUserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(currentAssignedTo || null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const fetchedUsers = await UserService.getActiveUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        // Fallback to mock users if API fails
        console.warn('Failed to fetch users, using mock data:', error);
        setUsers(UserService.MOCK_USERS.filter(u => u.status === 'Active'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAssign = async (user: SystemUser) => {
    try {
      // For now, we'll just call the callback and show a toast
      // In a real app, you'd make an API call here
      await UserService.assignBooking({
        bookingId,
        assignedTo: user.id,
        assignedByName: 'Admin', // Replace with actual logged-in user
      });

      setSelectedUserId(user.id);
      setIsOpen(false);
      onAssign(user.name);
    } catch (error) {
      // Fallback to client-side only if API fails
      console.warn('API assignment failed, using client-side fallback:', error);
      setSelectedUserId(user.id);
      setIsOpen(false);
      onAssign(user.name);
    }
  };

  const getSelectedUserName = () => {
    if (!selectedUserId) return null;
    const user = users.find(u => u.id === selectedUserId);
    return user?.name;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
      >
        <User className="w-4 h-4" />
        {getSelectedUserName() ? (
          <span>Assigned to {getSelectedUserName()}</span>
        ) : (
          <span>Assign</span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                No active users found
              </div>
            ) : (
              <div className="space-y-1">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleAssign(user)}
                    className="w-full px-3 py-2.5 rounded-lg hover:bg-accent transition-colors flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-foreground truncate" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                          {user.name}
                        </p>
                        <p className="text-muted-foreground truncate" style={{ fontSize: 'var(--text-small)' }}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {selectedUserId === user.id && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

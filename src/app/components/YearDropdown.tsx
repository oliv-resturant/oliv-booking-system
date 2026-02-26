import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface YearDropdownProps {
  value: string;
  onChange: (value: string) => void;
  years: string[];
  className?: string;
}

export function YearDropdown({ 
  value, 
  onChange, 
  years,
  className = ''
}: YearDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-colors flex items-center gap-2 cursor-pointer" 
        style={{ fontSize: 'var(--text-base)' }}
      >
        {value}
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-card rounded-lg shadow-lg border border-border overflow-hidden z-50">
          {years.map((year, index) => (
            <button
              key={year}
              onClick={() => {
                onChange(year);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left cursor-pointer ${
                year === value ? 'bg-accent' : ''
              } ${index > 0 ? 'border-t border-border' : ''}`}
            >
              <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                {year}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
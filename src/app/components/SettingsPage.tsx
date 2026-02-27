import { useState } from 'react';
import { Globe, DollarSign, Check, MapPin, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';
import { VenueService } from '../../services/venue.service';
import { toast } from 'sonner';

export function SettingsPage() {
  const [language, setLanguage] = useState('English');
  const [timeZone, setTimeZone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [currency, setCurrency] = useState('CHF');
  const [showCurrencySymbol, setShowCurrencySymbol] = useState(true);

  // Venue Locations State
  const [locations, setLocations] = useState<string[]>(VenueService.getLocations());
  const [newLocationName, setNewLocationName] = useState('');
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAddLocation = () => {
    if (!newLocationName.trim()) return;
    if (locations.includes(newLocationName.trim())) {
      toast.error('Location already exists');
      return;
    }
    VenueService.addLocation(newLocationName.trim());
    setLocations(VenueService.getLocations());
    setNewLocationName('');
    toast.success('Location added successfully');
  };

  const handleDeleteLocation = (name: string) => {
    VenueService.deleteLocation(name);
    setLocations(VenueService.getLocations());
    toast.success('Location deleted');
  };

  const handleStartEdit = (name: string) => {
    setEditingLocation(name);
    setEditingValue(name);
  };

  const handleSaveEdit = () => {
    if (!editingLocation || !editingValue.trim()) return;
    if (locations.includes(editingValue.trim()) && editingValue.trim() !== editingLocation) {
      toast.error('Location already exists');
      return;
    }
    VenueService.updateLocation(editingLocation, editingValue.trim());
    setLocations(VenueService.getLocations());
    setEditingLocation(null);
    toast.success('Location updated');
  };

  // Language options
  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'German', label: 'German' },
    { value: 'French', label: 'French' },
    { value: 'Italian', label: 'Italian' },
  ];

  // Time Zone options
  const timeZoneOptions = [
    { value: 'Europe/Zurich', label: 'Europe/Zurich (GMT+1)' },
    { value: 'Europe/London', label: 'Europe/London (GMT+0)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)' },
  ];

  // Date Format options
  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g., 02/05/2026)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g., 05/02/2026)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (e.g., 2026-02-05)' },
    { value: 'DD MMM YYYY', label: 'DD MMM YYYY (e.g., 05 Feb 2026)' },
    { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (e.g., Feb 05, 2026)' },
  ];

  // Currency options
  const currencyOptions = [
    { value: 'CHF', label: 'CHF - Swiss Franc' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'GBP', label: 'GBP - British Pound' },
  ];

  return (
    <div className="min-h-full bg-background px-4 md:px-8 pt-4 md:pt-6 pb-1 flex flex-col">
      <div className="w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Language & Region Card */}
          <div className="bg-card border border-border rounded-xl p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                Language & Region
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {/* Language Field */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                  Language
                </label>
                <StatusDropdown
                  options={languageOptions}
                  value={language}
                  onChange={(value) => setLanguage(value)}
                  placeholder="Select language"
                  className="w-full"
                />
              </div>

              {/* Time Zone Field */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                  Time Zone
                </label>
                <StatusDropdown
                  options={timeZoneOptions}
                  value={timeZone}
                  onChange={(value) => setTimeZone(value)}
                  placeholder="Select time zone"
                  className="w-full"
                />
              </div>

              {/* Date Format Field */}
              <div className="col-span-2">
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                  Date Format
                </label>
                <StatusDropdown
                  options={dateFormatOptions}
                  value={dateFormat}
                  onChange={(value) => setDateFormat(value)}
                  placeholder="Select date format"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Currency Card */}
          <div className="bg-card border border-border rounded-xl p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                Currency
              </h3>
            </div>

            <div className="space-y-6">
              {/* Currency Field */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                  Currency
                </label>
                <StatusDropdown
                  options={currencyOptions}
                  value={currency}
                  onChange={(value) => setCurrency(value)}
                  placeholder="Select currency"
                  className="w-full"
                />
              </div>

              {/* Show Currency Symbol Checkbox */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCurrencySymbol(!showCurrencySymbol)}
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: 'var(--radius-xs)',
                    border: showCurrencySymbol ? 'none' : '2px solid var(--color-border)',
                    backgroundColor: showCurrencySymbol ? 'var(--color-primary)' : 'transparent',
                  }}
                >
                  {showCurrencySymbol && (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  )}
                </button>
                <label
                  onClick={() => setShowCurrencySymbol(!showCurrencySymbol)}
                  className="text-foreground cursor-pointer"
                  style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  Show currency symbol in reports
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Venue Management Card */}
        <div className="bg-card border border-border rounded-xl p-4 md:p-6 mt-6 lg:mt-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                Venue Management
              </h3>
            </div>
          </div>

          <div className="space-y-6">
            {/* Add New Location */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Enter new location name (e.g., Wine Cellar)"
                  className="w-full pl-4 pr-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  style={{ fontSize: 'var(--text-base)' }}
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()}
                />
              </div>
              <button
                onClick={handleAddLocation}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-medium shadow-sm active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                Add Location
              </button>
            </div>

            {/* Locations List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((loc) => (
                <div key={loc} className="group bg-background border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/50 hover:shadow-md transition-all duration-300">
                  <div className="flex-1 min-w-0 mr-3">
                    {editingLocation === loc ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="w-full bg-input-background border border-primary/30 rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' ? handleSaveEdit() : e.key === 'Escape' && setEditingLocation(null)}
                      />
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-foreground font-semibold truncate block" style={{ fontSize: 'var(--text-base)' }}>
                          {loc}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5 opacity-60">Venue Location</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    {editingLocation === loc ? (
                      <>
                        <button onClick={handleSaveEdit} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" title="Save Changes">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingLocation(null)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Cancel">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleStartEdit(loc)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer" title="Edit Location">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteLocation(loc)} className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete Location">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {locations.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl bg-muted/5">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-primary/40" />
                </div>
                <p className="text-muted-foreground font-medium">No locations defined yet.</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Add your first venue area using the field above.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center pt-8 pb-1 mt-auto">
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
          © 2026 Restaurant Oliv Restaurant & Bar
        </p>
      </div>
    </div>
  );
}
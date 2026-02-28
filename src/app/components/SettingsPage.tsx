import { useState } from 'react';
import { Globe, DollarSign, Check, MapPin, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';
import { VenueService, VenueLocation } from '../../services/venue.service';
import { toast } from 'sonner';
import { Modal } from './Modal';
import { Button } from './Button';

export function SettingsPage() {
  const [language, setLanguage] = useState('English');
  const [timeZone, setTimeZone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [currency, setCurrency] = useState('CHF');
  const [showCurrencySymbol, setShowCurrencySymbol] = useState(true);

  // Venue Locations State
  const [locations, setLocations] = useState<VenueLocation[]>(VenueService.getLocations());
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<VenueLocation | null>(null);
  const [locationTitle, setLocationTitle] = useState('');
  const [locationDetails, setLocationDetails] = useState('');

  const handleOpenAddModal = () => {
    setEditingLocation(null);
    setLocationTitle('');
    setLocationDetails('');
    setIsLocationModalOpen(true);
  };

  const handleOpenEditModal = (location: VenueLocation) => {
    setEditingLocation(location);
    setLocationTitle(location.title);
    setLocationDetails(location.details);
    setIsLocationModalOpen(true);
  };

  const handleSaveLocation = () => {
    if (!locationTitle.trim()) {
      toast.error('Location title is required');
      return;
    }

    if (editingLocation) {
      // Update existing location
      VenueService.updateLocation(editingLocation.id, locationTitle.trim(), locationDetails.trim());
      toast.success('Location updated successfully');
    } else {
      // Add new location
      VenueService.addLocation(locationTitle.trim(), locationDetails.trim());
      toast.success('Location added successfully');
    }

    setLocations(VenueService.getLocations());
    setIsLocationModalOpen(false);
    setLocationTitle('');
    setLocationDetails('');
  };

  const handleDeleteLocation = (id: string) => {
    VenueService.deleteLocation(id);
    setLocations(VenueService.getLocations());
    toast.success('Location deleted');
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
            <Button
              variant="primary"
              icon={Plus}
              onClick={handleOpenAddModal}
              className="cursor-pointer"
            >
              Add Location
            </Button>
          </div>

          <div className="space-y-6">
            {/* Locations List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locations.map((loc) => (
                <div key={loc.id} className="group bg-background border border-border rounded-xl p-3 hover:border-primary/50 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-foreground font-semibold truncate block mb-1" style={{ fontSize: 'var(--text-base)' }}>
                        {loc.title}
                      </h4>
                      <p className="text-muted-foreground text-sm line-clamp-2" style={{ fontSize: 'var(--text-small)' }}>
                        {loc.details}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleOpenEditModal(loc)}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
                        title="Edit Location"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Location"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                <p className="text-sm text-muted-foreground/60 mt-1">Add your first venue area by clicking "Add Location" button.</p>
              </div>
            )}
          </div>
        </div>

        {/* Location Modal */}
        <Modal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          icon={MapPin}
          title={editingLocation ? 'Edit Location' : 'Add New Location'}
          maxWidth="md"
          footer={
            <>
              <Button
                variant="secondary"
                icon={X}
                onClick={() => setIsLocationModalOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={Check}
                onClick={handleSaveLocation}
                className="cursor-pointer"
                disabled={!locationTitle.trim()}
              >
                {editingLocation ? 'Save Changes' : 'Add Location'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                Location Title *
              </label>
              <input
                type="text"
                value={locationTitle}
                onChange={(e) => setLocationTitle(e.target.value)}
                placeholder="e.g., Wine Cellar"
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>

            <div>
              <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                Location Details
              </label>
              <textarea
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                placeholder="Describe this location (e.g., capacity, features, ambiance)"
                rows={3}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
          </div>
        </Modal>
      </div>

      <div className="text-center pt-8 pb-1 mt-auto">
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
          © 2026 Restaurant Oliv Restaurant & Bar
        </p>
      </div>
    </div>
  );
}
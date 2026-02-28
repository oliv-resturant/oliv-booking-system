const STORAGE_KEY = 'oliv_venue_locations';

export interface VenueLocation {
    id: string;
    title: string;
    details: string;
}

const DEFAULT_LOCATIONS: VenueLocation[] = [
    { id: '1', title: 'Main Hall', details: 'Primary dining area with capacity for 100 guests' },
    { id: '2', title: 'Garden Terrace', details: 'Outdoor seating with garden views, perfect for summer events' },
    { id: '3', title: 'Private Dining Room', details: 'Intimate space for private parties up to 20 guests' },
    { id: '4', title: 'Rooftop Bar', details: 'Scenic rooftop bar with panoramic city views' },
    { id: '5', title: 'Basement Lounge', details: 'Cozy underground lounge for casual gatherings' },
];

export const VenueService = {
    getLocations(): VenueLocation[] {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            this.saveLocations(DEFAULT_LOCATIONS);
            return DEFAULT_LOCATIONS;
        }
        try {
            const parsed = JSON.parse(stored);

            // Migration: Check if data is in old format (string array)
            if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
                // Migrate old string array to new object format
                const migrated: VenueLocation[] = parsed.map((title, index) => ({
                    id: (index + 1).toString(),
                    title,
                    details: ''
                }));
                this.saveLocations(migrated);
                return migrated;
            }

            return parsed;
        } catch (e) {
            console.error('Error parsing venue locations', e);
            return DEFAULT_LOCATIONS;
        }
    },

    saveLocations(locations: VenueLocation[]): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    },

    addLocation(title: string, details: string): void {
        const locations = this.getLocations();
        const newLocation: VenueLocation = {
            id: Date.now().toString(),
            title,
            details
        };
        locations.push(newLocation);
        this.saveLocations(locations);
    },

    updateLocation(id: string, title: string, details: string): void {
        const locations = this.getLocations();
        const index = locations.findIndex(loc => loc.id === id);
        if (index !== -1) {
            locations[index] = { ...locations[index], title, details };
            this.saveLocations(locations);
        }
    },

    deleteLocation(id: string): void {
        const locations = this.getLocations().filter(loc => loc.id !== id);
        this.saveLocations(locations);
    }
};

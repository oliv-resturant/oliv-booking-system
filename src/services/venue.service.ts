const STORAGE_KEY = 'oliv_venue_locations';
const DEFAULT_LOCATIONS = ["Main Hall", "Garden Terrace", "Private Dining Room", "Rooftop Bar", "Basement Lounge"];

export const VenueService = {
    getLocations(): string[] {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            this.saveLocations(DEFAULT_LOCATIONS);
            return DEFAULT_LOCATIONS;
        }
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing venue locations', e);
            return DEFAULT_LOCATIONS;
        }
    },

    saveLocations(locations: string[]): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    },

    addLocation(name: string): void {
        const locations = this.getLocations();
        if (!locations.includes(name)) {
            locations.push(name);
            this.saveLocations(locations);
        }
    },

    updateLocation(oldName: string, newName: string): void {
        const locations = this.getLocations();
        const index = locations.indexOf(oldName);
        if (index !== -1 && !locations.includes(newName)) {
            locations[index] = newName;
            this.saveLocations(locations);
        }
    },

    deleteLocation(name: string): void {
        const locations = this.getLocations().filter(loc => loc !== name);
        this.saveLocations(locations);
    }
};

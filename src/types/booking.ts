/**
 * Booking Type Definitions
 * Centralized TypeScript interfaces for booking-related data structures.
 */

import type { KitchenPdfStatus } from '@/services/kitchen-pdf.service';

/**
 * Customer information associated with a booking.
 */
export interface BookingCustomer {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  avatarColor: string;
  address: string;
}

/**
 * Event details for a booking.
 */
export interface BookingEvent {
  date: string;
  time: string;
  occasion: string;
}

/**
 * Menu item in a booking.
 */
export interface BookingMenuItem {
  item: string;
  category: string;
  quantity: string;
  price: string;
}

/**
 * Contact history entry for a booking.
 */
export interface BookingContactHistory {
  by: string;
  time: string;
  date: string;
  action: string;
}

/**
 * Booking contact information.
 */
export interface BookingContacted {
  by: string;
  when: string;
}

/**
 * Complete Booking interface with all properties.
 */
export interface Booking {
  id: number;
  customer: BookingCustomer;
  event: BookingEvent;
  guests: number;
  amount: string;
  status: string;
  contacted: BookingContacted;
  booking: string;
  allergies: string;
  notes: string;
  menuItems: BookingMenuItem[];
  contactHistory: BookingContactHistory[];
  kitchenPdf?: KitchenPdfStatus;
}

/**
 * Props for booking detail pages.
 */
export interface BookingDetailPageProps {
  booking: Booking;
  onBack: () => void;
}

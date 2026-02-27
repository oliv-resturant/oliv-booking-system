/**
 * Kitchen PDF Service
 * Handles sending booking PDFs to the kitchen workflow via email.
 * Includes idempotency protection and send history tracking.
 */

import { apiRequest } from './api/client';

/**
 * Request payload for sending PDF to kitchen.
 */
export interface SendKitchenPdfRequest {
  bookingId: number;
  documentName: string;
  sentBy: string;
}

/**
 * Response from sending PDF to kitchen.
 */
export interface SendKitchenPdfResponse {
  success: boolean;
  documentName: string;
  sentAt: string;          // ISO timestamp
  messageId: string;        // For idempotency tracking
  kitchenEmail: string;     // Email address that received the PDF
}

/**
 * Kitchen PDF send log entry.
 */
export interface KitchenPdfLog {
  id: string;
  bookingId: number;
  documentName: string;
  sentAt: string;
  sentBy: string;
  status: 'sent' | 'failed';
  errorMessage?: string;
}

/**
 * Kitchen PDF status for a booking.
 */
export interface KitchenPdfStatus {
  documentName: string;
  sentStatus: 'not_sent' | 'sent' | 'failed';
  lastSentAt?: string;        // ISO timestamp
  sentBy?: string;            // Admin name
  sendAttempts: number;       // For idempotency tracking
  errorMessage?: string;      // Last error message if failed
}

/**
 * Service class for kitchen PDF operations.
 */
export class KitchenPdfService {
  /**
   * Send PDF to kitchen email with idempotency protection.
   *
   * @param request - Send request payload
   * @param idempotencyKey - Unique key to prevent duplicate sends
   * @returns Promise with send response
   * @throws ApiError on API failures
   */
  static async sendToKitchen(
    request: SendKitchenPdfRequest,
    idempotencyKey: string
  ): Promise<SendKitchenPdfResponse> {
    return apiRequest<SendKitchenPdfResponse>('/kitchen-pdf/send', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(request),
    });
  }

  /**
   * Get send history for a specific booking.
   *
   * @param bookingId - The booking ID
   * @returns Promise with array of send logs
   * @throws ApiError on API failures
   */
  static async getSendHistory(bookingId: number): Promise<KitchenPdfLog[]> {
    return apiRequest<KitchenPdfLog[]>(`/kitchen-pdf/history/${bookingId}`);
  }

  /**
   * Generate a unique idempotency key for a booking.
   * Format: kitchen-pdf-{bookingId}-{timestamp}
   *
   * @param bookingId - The booking ID
   * @returns Unique idempotency key
   */
  static generateIdempotencyKey(bookingId: number): string {
    return `kitchen-pdf-${bookingId}-${Date.now()}`;
  }

  /**
   * Check if a PDF was recently sent (within 5 minutes).
   * Used to warn users about potential duplicate sends.
   *
   * @param lastSentAt - ISO timestamp of last send
   * @returns true if sent within 5 minutes, false otherwise
   */
  static wasRecentlySent(lastSentAt?: string): boolean {
    if (!lastSentAt) return false;

    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const lastSentTime = new Date(lastSentAt).getTime();

    return lastSentTime > fiveMinutesAgo;
  }

  /**
   * Format a timestamp for display.
   *
   * @param isoTimestamp - ISO timestamp string
   * @returns Formatted date/time string (e.g., "5 minutes ago")
   */
  static formatTimestamp(isoTimestamp: string): string {
    const now = Date.now();
    const then = new Date(isoTimestamp).getTime();
    const diffMs = now - then;

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  /**
   * Get the document name for a booking.
   *
   * @param bookingId - The booking ID
   * @returns Document name (e.g., "Booking #1234 – Kitchen Sheet")
   */
  static getDocumentName(bookingId: number): string {
    return `Booking #${bookingId} – Kitchen Sheet`;
  }

  /**
   * Create initial kitchen PDF status for a booking.
   *
   * @param bookingId - The booking ID
   * @returns Initial status object
   */
  static createInitialStatus(bookingId: number): KitchenPdfStatus {
    return {
      documentName: this.getDocumentName(bookingId),
      sentStatus: 'not_sent',
      sendAttempts: 0,
    };
  }
}

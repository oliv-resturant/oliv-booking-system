/**
 * User Service
 * Handles user-related operations including fetching system users.
 */

import { apiRequest } from '../services/api/client';

/**
 * System user interface.
 */
export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Staff' | 'Viewer';
  status: 'Active' | 'Inactive';
}

/**
 * Assign booking request payload.
 */
export interface AssignBookingRequest {
  bookingId: number;
  assignedTo: string; // User ID
  assignedByName: string; // Name of admin making the assignment
}

/**
 * Assign booking response.
 */
export interface AssignBookingResponse {
  success: boolean;
  bookingId: number;
  assignedTo: {
    id: string;
    name: string;
  };
  assignedBy: string;
  assignedAt: string;
}

/**
 * Service class for user operations.
 */
export class UserService {
  /**
   * Fetch all system users.
   *
   * @returns Promise with array of system users
   */
  static async getUsers(): Promise<SystemUser[]> {
    return apiRequest<SystemUser[]>('/users');
  }

  /**
   * Get only active users (for assignment dropdowns).
   *
   * @returns Promise with array of active users
   */
  static async getActiveUsers(): Promise<SystemUser[]> {
    const users = await this.getUsers();
    return users.filter(user => user.status === 'Active');
  }

  /**
   * Assign a booking to a user.
   *
   * @param request - Assign booking request payload
   * @returns Promise with assign booking response
   */
  static async assignBooking(request: AssignBookingRequest): Promise<AssignBookingResponse> {
    return apiRequest<AssignBookingResponse>(`/bookings/${request.bookingId}/assign`, {
      method: 'POST',
      body: JSON.stringify({
        assignedTo: request.assignedTo,
        assignedByName: request.assignedByName,
      }),
    });
  }

  /**
   * Mock users for development (fallback if API fails).
   */
  static readonly MOCK_USERS: SystemUser[] = [
    {
      id: '1',
      name: 'John Anderson',
      email: 'john.anderson@restaurant.com',
      role: 'Admin',
      status: 'Active',
    },
    {
      id: '2',
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@restaurant.com',
      role: 'Manager',
      status: 'Active',
    },
    {
      id: '3',
      name: 'Mike Thompson',
      email: 'mike.thompson@restaurant.com',
      role: 'Staff',
      status: 'Active',
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@restaurant.com',
      role: 'Viewer',
      status: 'Inactive',
    },
    {
      id: '5',
      name: 'David Wilson',
      email: 'david.wilson@restaurant.com',
      role: 'Staff',
      status: 'Active',
    },
  ];
}

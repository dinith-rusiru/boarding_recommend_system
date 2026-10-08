import api from './api';
import { BoardingPlace, User } from '../types';

export interface AdminStats {
  total_students: number;
  total_landlords: number;
  total_boarding_places: number;
  pending_approvals: number;
  active_listings: number;
  rejected_listings: number;
  total_recommendations_computed: number;
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get<AdminStats>('/admin/dashboard');
    return response.data;
  },

  getListings: async (statusFilter?: string): Promise<BoardingPlace[]> => {
    const response = await api.get<BoardingPlace[]>('/admin/listings', { params: { status_filter: statusFilter } });
    return response.data;
  },

  updateListingStatus: async (placeId: number, status: string): Promise<{ message: string; place: BoardingPlace }> => {
    const response = await api.put<{ message: string; place: BoardingPlace }>(`/admin/listings/${placeId}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  getUsers: async (role?: string): Promise<User[]> => {
    const response = await api.get<User[]>('/admin/users', { params: { role } });
    return response.data;
  },
};

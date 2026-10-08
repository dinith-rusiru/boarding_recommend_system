import api from './api';
import { BoardingPlace } from '../types';

export const landlordService = {
  getMyListings: async (): Promise<BoardingPlace[]> => {
    const response = await api.get<BoardingPlace[]>('/landlord/listings');
    return response.data;
  },

  createListing: async (data: any): Promise<BoardingPlace> => {
    const response = await api.post<BoardingPlace>('/landlord/listings', data);
    return response.data;
  },

  updateListing: async (id: number, data: any): Promise<BoardingPlace> => {
    const response = await api.put<BoardingPlace>(`/landlord/listings/${id}`, data);
    return response.data;
  },

  deleteListing: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/landlord/listings/${id}`);
    return response.data;
  },
};

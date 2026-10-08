import api from './api';
import { BoardingPlace, Facility } from '../types';

export const boardingService = {
  getListings: async (params?: { max_price?: number; accommodation_type?: string; min_safety?: number }): Promise<BoardingPlace[]> => {
    const response = await api.get<BoardingPlace[]>('/boarding', { params });
    return response.data;
  },

  getDetails: async (id: number): Promise<BoardingPlace> => {
    const response = await api.get<BoardingPlace>(`/boarding/${id}`);
    return response.data;
  },

  getFacilities: async (): Promise<Facility[]> => {
    const response = await api.get<Facility[]>('/facilities');
    return response.data;
  },
};

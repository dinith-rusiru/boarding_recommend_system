import api from './api';
import { StudentProfile, BoardingPlace } from '../types';

export const studentService = {
  getProfile: async (): Promise<StudentProfile> => {
    const response = await api.get<StudentProfile>('/student/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<StudentProfile> & { weights?: any }): Promise<StudentProfile> => {
    const response = await api.put<StudentProfile>('/student/profile', data);
    return response.data;
  },

  getFavorites: async (): Promise<BoardingPlace[]> => {
    const response = await api.get<BoardingPlace[]>('/student/favorites');
    return response.data;
  },

  toggleFavorite: async (boardingPlaceId: number): Promise<{ saved: boolean; message: string }> => {
    const response = await api.post<{ saved: boolean; message: string }>(`/student/favorites/${boardingPlaceId}`);
    return response.data;
  },
};

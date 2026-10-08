import api from './api';
import { RecommendationListResponse } from '../types';

export const recommendationService = {
  getRecommendations: async (params?: {
    university_lat?: number;
    university_lng?: number;
    max_budget?: number;
    max_distance?: number;
  }): Promise<RecommendationListResponse> => {
    const response = await api.get<RecommendationListResponse>('/recommendations', { params });
    return response.data;
  },
};

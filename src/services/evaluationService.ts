import api from './api';
import { EvaluationInput, EvaluationStats } from '../types';

export const evaluationService = {
  submitEvaluation: async (data: EvaluationInput): Promise<any> => {
    const response = await api.post('/evaluation', data);
    return response.data;
  },

  getStats: async (): Promise<EvaluationStats> => {
    const response = await api.get<EvaluationStats>('/evaluation/stats');
    return response.data;
  },
};

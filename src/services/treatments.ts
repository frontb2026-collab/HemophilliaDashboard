import { apiClient } from '../lib/api';
import { Treatment, TreatmentRequest } from '../types/api';

export class TreatmentsService {
  static async getAll(): Promise<Treatment[]> {
    return apiClient.get<Treatment[]>('/Treatments');
  }

  static async getById(id: number): Promise<Treatment> {
    return apiClient.get<Treatment>(`/Treatments/${id}`);
  }

  static async create(treatment: TreatmentRequest): Promise<Treatment> {
    return apiClient.post<Treatment>('/Treatments', treatment);
  }

  static async update(id: number, treatment: TreatmentRequest): Promise<void> {
    await apiClient.put(`/Treatments/${id}`, treatment);
  }

  static async delete(id: number): Promise<void> {
    await apiClient.delete(`/Treatments/${id}`);
  }
}

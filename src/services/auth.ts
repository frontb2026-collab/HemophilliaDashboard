import { apiClient } from '../lib/api';
import { User, LoginRequest, RegisterRequest } from '../types/api';

interface AuthResponse {
  token: string;
  user: User;
}

export class AuthService {
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials, false);

    if (response.token) {
      localStorage.setItem('hemocore_token', response.token);
    }

    return response;
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData, false);

    if (response.token) {
      localStorage.setItem('hemocore_token', response.token);
    }

    return response;
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('hemocore_token');
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('hemocore_token');
      if (!token) {
        return null;
      }

      const user = await apiClient.get<User>('/auth/me');
      return user;
    } catch (error) {
      return null;
    }
  }

  static async getToken(): Promise<string | null> {
    return localStorage.getItem('hemocore_token');
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = localStorage.getItem('hemocore_token');
    return !!token;
  }

  static clearAuth(): void {
    localStorage.removeItem('hemocore_token');
  }
}

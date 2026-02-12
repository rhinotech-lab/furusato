const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // ローカルストレージからトークンを取得
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || 'リクエストに失敗しました');
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_URL);

// 認証API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post<{
      user: {
        id: number;
        name: string;
        email: string;
        type: 'admin' | 'municipality' | 'business';
        municipality_id: number | null;
        business_id: number | null;
      };
      token: string;
    }>('/login', { email, password });
    
    if (response.token) {
      apiClient.setToken(response.token);
    }
    
    return response;
  },

  logout: async () => {
    await apiClient.post('/logout');
    apiClient.setToken(null);
  },

  me: async () => {
    return apiClient.get<{
      user: {
        id: number;
        name: string;
        email: string;
        type: 'admin' | 'municipality' | 'business';
        municipality_id: number | null;
        business_id: number | null;
      };
    }>('/me');
  },
};

// ユーザー管理API
export const userApi = {
  list: async (params?: { type?: string; per_page?: number }) => {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return apiClient.get(`/users${queryString}`);
  },

  get: async (id: number) => {
    return apiClient.get(`/users/${id}`);
  },

  create: async (data: {
    name: string;
    email: string;
    password: string;
    type: 'admin' | 'municipality' | 'business';
    municipality_id?: number;
    business_id?: number;
  }) => {
    return apiClient.post('/users', data);
  },

  update: async (id: number, data: Partial<{
    name: string;
    email: string;
    password: string;
    type: 'admin' | 'municipality' | 'business';
    municipality_id?: number;
    business_id?: number;
  }>) => {
    return apiClient.put(`/users/${id}`, data);
  },

  delete: async (id: number) => {
    return apiClient.delete(`/users/${id}`);
  },
};

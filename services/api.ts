import { LocationRecord } from "@/locations";
import { store } from "@/store";

export const API_BASE_URL = __DEV__
  ? "http://192.168.164.198:8000" // use this for physical device(change this to match your host IP)
  // ? "http://10.0.2.2:8000" // use for emulator
  : "https://testsite.esomelo.com/thea";

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

class ApiService {
  private static instance: ApiService;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private getAccessToken() {
    return store.getState().auth.token;
  }

  private getHeaders(endpoint?: string): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (endpoint !== "/login/" && endpoint !== "/register/") {
      headers["Authorization"] = `Bearer ${this.getAccessToken()}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || "An error occurred",
        response.status
      );
    }

    const data = await response.json();
    return {
      data,
      status: response.status,
      message: "Success",
    };
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(endpoint),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }
}

export const apiService = ApiService.getInstance();

export const userApi = {
  login: (credentials: LoginCredentials) =>
    apiService.post<AuthResponse>("/login/subject/", credentials),
  register: (details: RegisterDetails) =>
    apiService.post<AuthResponse>("/register/subject/", details),
};

export const locationsApi = {
  saveLocation: async (data: LocationRecord) => {
    const _data = {
      locations: [data],
    };
    await apiService.post<Subject>("/api/locations/", _data);
  },
};

interface Subject {
  id: string;
  name: string;
  email: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterDetails {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  access: string;
  subject: Subject;
}

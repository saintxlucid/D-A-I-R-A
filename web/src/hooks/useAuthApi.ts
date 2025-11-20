import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { AuthUser } from '../store/authStore';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// Login
export const useLogin = () => {
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const setError = useAuthStore((state) => state.setError);

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await api.post<AuthResponse>('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      setError(null);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    },
  });
};

// Register
export const useRegister = () => {
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const setError = useAuthStore((state) => state.setError);

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      setError(null);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(message);
    },
  });
};

// Forgot Password
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: ForgotPasswordRequest) => {
      const response = await api.post('/auth/forgot-password', data);
      return response.data;
    },
  });
};

// Reset Password
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    },
  });
};

// Refresh Token
export const useRefreshToken = () => {
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      const response = await api.post<{ accessToken: string }>(
        '/auth/refresh',
        { refreshToken }
      );
      return response.data.accessToken;
    },
    onSuccess: (newAccessToken) => {
      setAccessToken(newAccessToken);
    },
    onError: () => {
      logout();
    },
  });
};

// Verify Auth Status
export const useCheckAuth = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['auth', 'check'],
    queryFn: async () => {
      if (!accessToken) return null;
      const response = await api.get<AuthUser>('/auth/me');
      return response.data;
    },
    onSuccess: (user) => {
      if (user) {
        setUser(user);
      }
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
    onError: () => {
      // Logout locally even if API call fails
      logout();
      queryClient.clear();
    },
  });
};

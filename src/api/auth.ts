import apiClient from './client'
import type { AuthResponse, LoginInput, RegisterInput } from '@/types'

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', data)
    return res.data
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data)
    return res.data
  },

  me: async (): Promise<AuthResponse['user']> => {
    const res = await apiClient.get<AuthResponse['user']>('/auth/me')
    return res.data
  },
}

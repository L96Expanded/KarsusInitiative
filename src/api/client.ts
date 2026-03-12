import axios, { AxiosError } from 'axios'

const BASE_URL = '/api'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
// Uses X-Auth-Token instead of Authorization because Azure SWA intercepts the
// Authorization header for its own EasyAuth system before forwarding to Functions.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['X-Auth-Token'] = `Bearer ${token}`
  }
  return config
})

// Surface API error messages
apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string }>) => {
    const message = err.response?.data?.message ?? err.message ?? 'Unknown error'
    return Promise.reject(new Error(message))
  },
)

export default apiClient

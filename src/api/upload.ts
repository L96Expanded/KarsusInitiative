import apiClient from './client'

export const uploadApi = {
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await apiClient.post<{ url: string }>('/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
}

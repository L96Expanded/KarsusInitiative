import apiClient from './client'
import type {
  Preset,
  CreatePresetInput,
  UpdatePresetInput,
  CreateCreatureInput,
  Creature,
} from '@/types'

export const presetsApi = {
  list: async (): Promise<Preset[]> => {
    const res = await apiClient.get<Preset[]>('/presets')
    return res.data
  },

  get: async (id: string): Promise<Preset> => {
    const res = await apiClient.get<Preset>(`/presets/${id}`)
    return res.data
  },

  create: async (data: CreatePresetInput): Promise<Preset> => {
    const res = await apiClient.post<Preset>('/presets', data)
    return res.data
  },

  update: async (id: string, data: UpdatePresetInput): Promise<Preset> => {
    const res = await apiClient.put<Preset>(`/presets/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/presets/${id}`)
  },

  addCreature: async (presetId: string, creature: CreateCreatureInput): Promise<Preset> => {
    const res = await apiClient.post<Preset>(`/presets/${presetId}/creatures`, creature)
    return res.data
  },

  updateCreature: async (
    presetId: string,
    creatureId: string,
    data: Partial<Creature>,
  ): Promise<Preset> => {
    const res = await apiClient.put<Preset>(`/presets/${presetId}/creatures/${creatureId}`, data)
    return res.data
  },

  deleteCreature: async (presetId: string, creatureId: string): Promise<Preset> => {
    const res = await apiClient.delete<Preset>(`/presets/${presetId}/creatures/${creatureId}`)
    return res.data
  },
}

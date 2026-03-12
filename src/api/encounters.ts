import apiClient from './client'
import type {
  Encounter,
  CreateEncounterInput,
  UpdateEncounterInput,
  CreateCreatureInput,
  Creature,
  TurnState,
} from '@/types'

export const encountersApi = {
  list: async (): Promise<Encounter[]> => {
    const res = await apiClient.get<Encounter[]>('/encounters')
    return res.data
  },

  get: async (id: string): Promise<Encounter> => {
    const res = await apiClient.get<Encounter>(`/encounters/${id}`)
    return res.data
  },

  create: async (data: CreateEncounterInput): Promise<Encounter> => {
    const res = await apiClient.post<Encounter>('/encounters', data)
    return res.data
  },

  createFromPreset: async (presetId: string): Promise<Encounter> => {
    const res = await apiClient.post<Encounter>(`/encounters/from-preset/${presetId}`)
    return res.data
  },

  update: async (id: string, data: UpdateEncounterInput): Promise<Encounter> => {
    const res = await apiClient.put<Encounter>(`/encounters/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/encounters/${id}`)
  },

  // Creature operations
  addCreature: async (encounterId: string, creature: CreateCreatureInput): Promise<Encounter> => {
    const res = await apiClient.post<Encounter>(`/encounters/${encounterId}/creatures`, creature)
    return res.data
  },

  updateCreature: async (
    encounterId: string,
    creatureId: string,
    data: Partial<Creature>,
  ): Promise<Encounter> => {
    const res = await apiClient.put<Encounter>(
      `/encounters/${encounterId}/creatures/${creatureId}`,
      data,
    )
    return res.data
  },

  deleteCreature: async (encounterId: string, creatureId: string): Promise<Encounter> => {
    const res = await apiClient.delete<Encounter>(
      `/encounters/${encounterId}/creatures/${creatureId}`,
    )
    return res.data
  },

  // Turn management
  nextTurn: async (id: string): Promise<TurnState> => {
    const res = await apiClient.put<TurnState>(`/encounters/${id}/turn/next`)
    return res.data
  },

  prevTurn: async (id: string): Promise<TurnState> => {
    const res = await apiClient.put<TurnState>(`/encounters/${id}/turn/prev`)
    return res.data
  },
}

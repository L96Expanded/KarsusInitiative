// Re-exports the shared domain types used by both the API and the frontend.
// Keeping a local copy avoids violating the TypeScript `rootDir` constraint.

export type CreatureStatus =
  | 'alive'
  | 'unconscious'
  | 'dead'
  | 'concentrating'
  | 'poisoned'
  | 'stunned'
  | 'incapacitated'
  | 'charmed'
  | 'frightened'
  | 'paralyzed'
  | 'petrified'
  | 'blinded'
  | 'deafened'
  | 'invisible'
  | 'prone'
  | 'restrained'
  | 'exhaustion'

export interface Creature {
  id: string
  name: string
  initiative: number
  initiativeImageUrl?: string
  status: CreatureStatus
  currentHp?: number
  maxHp?: number
  armorClass?: number
  notes?: string
  isPlayer?: boolean
}

export interface CreateCreatureInput {
  name: string
  initiative: number
  initiativeImageUrl?: string
  status?: CreatureStatus
  currentHp?: number
  maxHp?: number
  armorClass?: number
  notes?: string
  isPlayer?: boolean
}

export interface Encounter {
  id: string
  userId: string
  title: string
  description?: string
  backgroundImageUrl?: string
  creatures: Creature[]
  currentTurn: number
  currentRound: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateEncounterInput {
  title: string
  description?: string
  backgroundImageUrl?: string
  creatures?: CreateCreatureInput[]
}

export interface UpdateEncounterInput {
  title?: string
  description?: string
  backgroundImageUrl?: string
}

export interface Preset {
  id: string
  userId: string
  name: string
  description?: string
  backgroundImageUrl?: string
  creatures: Creature[]
  createdAt: string
  updatedAt: string
}

export interface CreatePresetInput {
  name: string
  description?: string
  backgroundImageUrl?: string
  creatures?: CreateCreatureInput[]
}

export interface UpdatePresetInput {
  name?: string
  description?: string
  backgroundImageUrl?: string
}

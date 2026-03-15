// ─── Creature ────────────────────────────────────────────────────────────────

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
  /** Array of active conditions. Empty or ['alive'] = normal. */
  statuses: CreatureStatus[]
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
  statuses?: CreatureStatus[]
  /** @deprecated use statuses */
  status?: CreatureStatus
  currentHp?: number
  maxHp?: number
  armorClass?: number
  notes?: string
  isPlayer?: boolean
}

// ─── Encounter ───────────────────────────────────────────────────────────────

export interface Encounter {
  id: string
  userId: string
  title: string
  description?: string
  backgroundImageUrl?: string
  creatures: Creature[]
  currentTurn: number      // index into sorted creatures array
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

// ─── Preset ──────────────────────────────────────────────────────────────────

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

// ─── User / Auth ──────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  username: string
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  username: string
  password: string
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiError {
  message: string
  code?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// ─── Turn State ───────────────────────────────────────────────────────────────

export interface TurnState {
  currentTurn: number
  currentRound: number
  creatures: Creature[]
}

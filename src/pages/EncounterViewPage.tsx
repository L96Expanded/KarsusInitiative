import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Shield, Sword, User, ChevronUp } from 'lucide-react'
import { encountersApi } from '@/api/encounters'
import { useEncounterLive } from '@/hooks/useEncounterLive'
import { cn } from '@/lib/utils'
import type { Creature } from '@/types'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  alive:         { label: 'Alive',         color: 'text-emerald-400 bg-emerald-900/30 border-emerald-700/50' },
  unconscious:   { label: 'Unconscious',   color: 'text-yellow-400 bg-yellow-900/30 border-yellow-700/50' },
  dead:          { label: 'Dead',          color: 'text-gray-400   bg-gray-900/30   border-gray-700/50' },
  concentrating: { label: 'Concentrating', color: 'text-sky-400    bg-sky-900/30    border-sky-700/50' },
  poisoned:      { label: 'Poisoned',      color: 'text-lime-400   bg-lime-900/30   border-lime-700/50' },
  stunned:       { label: 'Stunned',       color: 'text-orange-400 bg-orange-900/30 border-orange-700/50' },
  incapacitated: { label: 'Incapacitated', color: 'text-red-400    bg-red-900/30    border-red-700/50' },
}

function HpBar({ current, max }: { current: number | undefined; max: number }) {
  const pct = current != null ? Math.max(0, Math.min(100, (current / max) * 100)) : 100
  return (
    <div className="w-full h-2 bg-dnd-dark rounded-full overflow-hidden">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          pct > 60 ? 'bg-emerald-500' : pct > 30 ? 'bg-yellow-500' : 'bg-red-500',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function InitiativeRow({ creature, isActive, rank }: { creature: Creature; isActive: boolean; rank: number }) {
  const status = STATUS_LABEL[creature.status] ?? { label: creature.status, color: 'text-dnd-muted bg-dnd-surface border-dnd-border' }
  const hpPct = creature.maxHp && creature.currentHp != null
    ? Math.max(0, Math.min(100, (creature.currentHp / creature.maxHp) * 100))
    : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-300',
        isActive
          ? 'bg-dnd-surface/30 border-dnd-gold/50 shadow-glow-gold'
          : 'bg-dnd-dark/60 border-dnd-border/40 opacity-75 hover:opacity-100',
        creature.status === 'dead' && 'grayscale opacity-30',
      )}
    >
      {/* Rank */}
      <span className={cn(
        'w-6 text-center font-body text-sm flex-shrink-0',
        isActive ? 'text-dnd-gold font-bold' : 'text-dnd-muted',
      )}>
        {rank}
      </span>

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {creature.initiativeImageUrl ? (
          <img
            src={creature.initiativeImageUrl}
            alt={creature.name}
            className={cn(
              'rounded-full object-cover border-2',
              isActive ? 'w-12 h-12 border-dnd-gold' : 'w-10 h-10 border-dnd-border/60',
            )}
          />
        ) : (
          <div className={cn(
            'rounded-full border-2 flex items-center justify-center bg-dnd-surface',
            isActive ? 'w-12 h-12 border-dnd-gold' : 'w-10 h-10 border-dnd-border/60',
          )}>
            {creature.isPlayer
              ? <User className={cn('w-5 h-5', isActive ? 'text-dnd-gold' : 'text-dnd-muted')} />
              : <Sword className={cn('w-5 h-5', isActive ? 'text-dnd-gold' : 'text-dnd-muted')} />
            }
          </div>
        )}
        {/* Initiative badge */}
        <span className={cn(
          'absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center border',
          isActive ? 'bg-dnd-gold text-black border-dnd-gold' : 'bg-dnd-crimson text-white border-dnd-dark',
        )}>
          {creature.initiative}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'font-body text-sm truncate',
            isActive ? 'text-dnd-gold font-semibold' : 'text-dnd-parchment',
          )}>
            {creature.name}
          </span>
          {creature.status !== 'alive' && (
            <span className={cn('hidden sm:inline-flex text-[10px] border rounded px-1.5 py-0.5 flex-shrink-0', status.color)}>
              {status.label}
            </span>
          )}
        </div>
        {hpPct !== null && (
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-1 h-1 bg-dnd-dark rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full', hpPct > 60 ? 'bg-emerald-500' : hpPct > 30 ? 'bg-yellow-500' : 'bg-red-500')}
                style={{ width: `${hpPct}%` }}
              />
            </div>
            <span className="text-[10px] text-dnd-muted whitespace-nowrap">
              {creature.currentHp}/{creature.maxHp}
            </span>
          </div>
        )}
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-dnd-gold animate-pulse" />
        </div>
      )}
    </motion.div>
  )
}

export default function EncounterViewPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()

  // Initial load + 30s heartbeat poll (WebSocket is the primary sync path)
  const { data: encounter, isLoading } = useQuery({
    queryKey: ['encounters', id, 'view'],
    queryFn: () => encountersApi.get(id!),
    enabled: !!id,
    refetchInterval: 3_000,
  })

  // Real-time WebSocket updates — patches the cache immediately on any change
  useEncounterLive(id, (enc) => {
    qc.setQueryData(['encounters', id, 'view'], enc)
  })

  if (isLoading || !encounter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-body tracking-widest animate-pulse text-xl" style={{ color: 'var(--theme-accent)' }}>
          Entering the battlefield…
        </div>
      </div>
    )
  }

  const sorted = [...encounter.creatures].sort((a, b) => b.initiative - a.initiative)
  const active = sorted[encounter.currentTurn] ?? null
  const activeStatus = active ? (STATUS_LABEL[active.status] ?? { label: active.status, color: 'text-dnd-muted bg-dnd-surface border-dnd-border' }) : null

  return (
    <div className="min-h-screen h-screen overflow-hidden flex flex-col bg-dnd-black">

      {/* ── Background image (encounter scene) ───────────────────── */}
      {encounter.backgroundImageUrl && (
        <div className="absolute inset-0 pointer-events-none">
          <img src={encounter.backgroundImageUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/85" />
        </div>
      )}
      {!encounter.backgroundImageUrl && (
        <div className="absolute inset-0 bg-gradient-to-br from-dnd-dark to-dnd-black pointer-events-none" />
      )}

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-3 bg-black/50 backdrop-blur-sm border-b border-dnd-border/40">
        <div>
          <h1 className="font-display text-dnd-gold text-lg tracking-widest">{encounter.title}</h1>
          {encounter.description && (
            <p className="text-dnd-muted font-ui text-xs italic">{encounter.description}</p>
          )}
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-dnd-muted text-[10px] font-body tracking-widest">ROUND</p>
            <p className="text-dnd-amber font-display text-2xl leading-none">{encounter.currentRound}</p>
          </div>
          <div className="text-center">
            <p className="text-dnd-muted text-[10px] font-body tracking-widest">TURN</p>
            <p className="text-dnd-parchment font-display text-2xl leading-none">
              {encounter.currentTurn + 1}
              <span className="text-dnd-muted text-sm">/{sorted.length}</span>
            </p>
          </div>
        </div>

        <p className="text-dnd-muted/40 text-[10px] font-ui italic">Display Window · Live sync</p>
      </header>

      {/* ── Main split layout ─────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 overflow-hidden">

        {/* ── LEFT: Active creature — full-height ~1/3 column ──────── */}
        <div className="w-1/3 flex-shrink-0 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.id}
                className="absolute inset-0"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
                transition={{ duration: 0 }}
              >
                {/* Creature image — fills full column top-to-bottom */}
                {active.initiativeImageUrl ? (
                  <img
                    src={active.initiativeImageUrl}
                    alt={active.name}
                    className={cn(
                      'absolute inset-0 w-full h-full object-cover object-top',
                      active.status === 'dead' && 'grayscale',
                    )}
                  />
                ) : (
                  <div className="absolute inset-0 bg-dnd-dark flex items-center justify-center">
                    {active.isPlayer
                      ? <User className="w-32 h-32 text-dnd-jade/20" />
                      : <Sword className="w-32 h-32 text-dnd-jade/20" />
                    }
                  </div>
                )}

                {/* Left accent bar — theme color */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: 'var(--theme-accent)', boxShadow: '0 0 24px rgba(var(--theme-accent-rgb), 0.5)' }}
                />

                {/* Bottom overlay: name, stats, status */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-32 pb-6 px-6">
                  {/* Active badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--theme-accent)' }} />
                    <span className="font-body text-[10px] tracking-[0.35em] uppercase" style={{ color: 'var(--theme-accent)' }}>Active Turn</span>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--theme-accent)' }} />
                  </div>

                  <h2 className="font-display text-dnd-parchment text-3xl leading-tight" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}>
                    {active.name}
                  </h2>
                  {active.isPlayer && (
                    <span
                      className="text-xs font-body tracking-widest"
                      style={{ color: 'var(--theme-accent)' }}
                    >PLAYER CHARACTER</span>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    {active.maxHp && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-red-400" />
                          <span className="font-body text-dnd-parchment text-base">
                            {active.currentHp ?? active.maxHp}
                            <span className="text-dnd-muted text-sm">/{active.maxHp}</span>
                          </span>
                        </div>
                        <HpBar current={active.currentHp} max={active.maxHp} />
                      </div>
                    )}
                    {active.armorClass && (
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-sky-400" />
                        <span className="font-body text-dnd-parchment text-base">AC {active.armorClass}</span>
                      </div>
                    )}
                    {activeStatus && active.status !== 'alive' && (
                      <span className={cn('text-xs border rounded px-2 py-0.5 capitalize', activeStatus.color)}>
                        {activeStatus.label}
                      </span>
                    )}
                  </div>

                  {/* Notes */}
                  {active.notes && (
                    <div className="mt-3 bg-dnd-dark/60 border border-dnd-border/40 rounded-lg px-3 py-2">
                      <p className="text-dnd-parchment/75 font-ui text-sm italic">{active.notes}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-dnd-muted font-ui italic">No active creature</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Divider ───────────────────────────────────────────── */}
        <div className="w-px bg-gradient-to-b from-transparent via-dnd-border/50 to-transparent self-stretch" />

        {/* ── RIGHT: Initiative order — remaining ~2/3 ─────────────── */}
        <div className="flex-1 flex flex-col bg-black/30 backdrop-blur-sm">
          {/* Header */}
          <div className="px-5 py-4 border-b border-dnd-border/30 flex items-center gap-2">
            <span
              className="font-body text-xs tracking-[0.3em] uppercase"
              style={{ color: 'var(--theme-accent)' }}
            >Initiative Order</span>
            <span className="ml-auto text-xs text-dnd-muted font-ui">
              {sorted.filter(c => c.status !== 'dead').length} active
            </span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {sorted.length === 0 ? (
              <p className="text-dnd-muted font-ui italic text-sm text-center mt-8">No creatures</p>
            ) : (
              sorted.map((creature, i) => (
                <InitiativeRow
                  key={creature.id}
                  creature={creature}
                  isActive={i === encounter.currentTurn}
                  rank={i + 1}
                />
              ))
            )}
          </div>

          {/* Footer — upcoming */}
          {sorted.length > 1 && (
            <div className="px-5 py-3 border-t border-dnd-border/30 bg-black/20">
              <p className="text-dnd-muted text-[10px] font-body tracking-widest uppercase mb-2">Up Next</p>
              {(() => {
                const nextIdx = (encounter.currentTurn + 1) % sorted.length
                const next = sorted[nextIdx]
                return (
                  <div className="flex items-center gap-2">
                    {next.initiativeImageUrl ? (
                      <img src={next.initiativeImageUrl} alt={next.name} className="w-8 h-8 rounded-full object-cover border border-dnd-border/60" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-dnd-surface border border-dnd-border/60 flex items-center justify-center">
                        {next.isPlayer ? <User className="w-4 h-4 text-dnd-muted" /> : <Sword className="w-4 h-4 text-dnd-muted" />}
                      </div>
                    )}
                    <div>
                      <p className="text-dnd-parchment font-body text-sm">{next.name}</p>
                      <p className="text-dnd-muted text-[10px]">Initiative {next.initiative}</p>
                    </div>
                    <ChevronUp className="ml-auto w-4 h-4 text-dnd-muted" />
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Sword, User, Heart, Shield } from 'lucide-react'
import type { Encounter, Creature } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  alive:         'text-green-400',
  unconscious:   'text-yellow-400',
  dead:          'text-gray-500',
  concentrating: 'text-blue-400',
  poisoned:      'text-emerald-400',
  stunned:       'text-orange-400',
}

interface EncounterViewProps {
  open: boolean
  onClose: () => void
  encounter: Encounter
  onNext: () => void
  onPrev: () => void
  loadingTurn?: boolean
}

function CreatureToken({ creature, isActive, index, total }: {
  creature: Creature
  isActive: boolean
  index: number
  total: number
}) {
  const angle = (index / total) * 360 - 90
  const radius = Math.min(280, 340 - total * 8)
  const x = Math.cos((angle * Math.PI) / 180) * radius
  const y = Math.sin((angle * Math.PI) / 180) * radius
  const hpPct = creature.maxHp && creature.currentHp != null
    ? Math.max(0, Math.min(100, (creature.currentHp / creature.maxHp) * 100))
    : null
  const statusColor = STATUS_COLORS[creature.status] ?? 'text-dnd-muted'

  return (
    <motion.div
      className="absolute"
      style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <div
        className={cn(
          'relative -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1',
          isActive && 'z-10',
        )}
      >
        {/* Token */}
        <div
          className={cn(
            'rounded-full border-3 overflow-hidden transition-all duration-500 cursor-default',
            isActive
              ? 'w-20 h-20 border-dnd-gold shadow-glow-gold ring-4 ring-dnd-gold/30'
              : 'w-14 h-14 border-dnd-border opacity-80 hover:opacity-100',
            creature.status === 'dead' && 'grayscale opacity-40',
          )}
          style={{ borderWidth: isActive ? 3 : 2 }}
        >
          {creature.initiativeImageUrl ? (
            <img src={creature.initiativeImageUrl} alt={creature.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-dnd-dark flex items-center justify-center">
              {creature.isPlayer
                ? <User className={cn('w-6 h-6', isActive ? 'text-dnd-gold' : 'text-dnd-muted')} />
                : <Sword className={cn('w-6 h-6', isActive ? 'text-dnd-gold' : 'text-dnd-muted')} />
              }
            </div>
          )}
        </div>

        {/* Initiative badge */}
        <span className={cn(
          'absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center border',
          isActive ? 'bg-dnd-gold text-black border-dnd-gold' : 'bg-dnd-crimson text-white border-dnd-dark',
        )}>
          {creature.initiative}
        </span>

        {/* HP mini bar */}
        {hpPct !== null && (
          <div className="w-14 h-1 bg-dnd-dark rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full', hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-yellow-500' : 'bg-red-500')}
              style={{ width: `${hpPct}%` }}
            />
          </div>
        )}

        {/* Name */}
        <span className={cn(
          'text-center max-w-[90px] leading-tight transition-all',
          isActive
            ? 'text-dnd-gold font-body text-sm font-semibold'
            : 'text-dnd-muted font-ui text-xs',
        )}
          style={{ textShadow: isActive ? '0 0 12px #D4AF37' : 'none' }}
        >
          {creature.name}
        </span>

        {/* Status */}
        {creature.status !== 'alive' && (
          <span className={cn('text-[10px] capitalize italic', statusColor)}>
            {creature.status}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default function EncounterView({
  open, onClose, encounter, onNext, onPrev, loadingTurn,
}: EncounterViewProps) {
  const sorted = [...encounter.creatures].sort((a, b) => b.initiative - a.initiative)
  const activeCreature = sorted[encounter.currentTurn] ?? null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Full-screen backdrop with encounter background */}
          <div className="absolute inset-0">
            {encounter.backgroundImageUrl ? (
              <>
                <img
                  src={encounter.backgroundImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
              </>
            ) : (
              <div className="w-full h-full bg-dnd-black bg-dragon-scale" />
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-dnd-surface/80 text-dnd-muted hover:text-dnd-parchment transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Round indicator */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-dnd-surface/80 backdrop-blur border border-dnd-border rounded-full px-6 py-2 flex items-center gap-4">
              <span className="font-body text-dnd-muted text-sm tracking-widest">ROUND</span>
              <span className="font-display text-dnd-gold text-2xl">{encounter.currentRound}</span>
            </div>
          </div>

          {/* Initiative circle */}
          <div className="relative z-10" style={{ width: 720, height: 720, maxWidth: '90vw', maxHeight: '80vw' }}>
            {/* Center info */}
            <div className="absolute inset-0 flex items-center justify-center">
              {activeCreature && (
                <motion.div
                  key={activeCreature.id}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <p className="font-body text-dnd-muted text-xs tracking-widest mb-1">ACTIVE TURN</p>
                  <p className="font-display text-dnd-gold text-2xl sm:text-3xl">{activeCreature.name}</p>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    {activeCreature.maxHp && (
                      <span className="flex items-center gap-1 text-sm text-dnd-parchment">
                        <Heart className="w-4 h-4 text-red-400" />
                        {activeCreature.currentHp ?? activeCreature.maxHp}/{activeCreature.maxHp}
                      </span>
                    )}
                    {activeCreature.armorClass && (
                      <span className="flex items-center gap-1 text-sm text-dnd-parchment">
                        <Shield className="w-4 h-4 text-blue-400" />
                        {activeCreature.armorClass}
                      </span>
                    )}
                  </div>
                  {activeCreature.status !== 'alive' && (
                    <p className="text-sm italic text-yellow-400 mt-1 capitalize">{activeCreature.status}</p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Creature tokens around circle */}
            {sorted.map((creature, i) => (
              <CreatureToken
                key={creature.id}
                creature={creature}
                isActive={i === encounter.currentTurn}
                index={i}
                total={sorted.length}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6">
            <button
              onClick={onPrev}
              disabled={loadingTurn}
              className="flex items-center gap-2 bg-dnd-surface/80 border border-dnd-border hover:border-dnd-gold text-dnd-parchment hover:text-dnd-gold backdrop-blur rounded-xl px-6 py-3 font-body text-sm tracking-widest uppercase transition-all disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="text-center">
              <p className="font-body text-dnd-muted text-xs tracking-widest">TURN</p>
              <p className="font-display text-dnd-gold text-xl">
                {encounter.currentTurn + 1} / {sorted.length}
              </p>
            </div>

            <button
              onClick={onNext}
              disabled={loadingTurn}
              className="flex items-center gap-2 bg-dnd-crimson/80 border border-dnd-crimson hover:bg-dnd-red text-white backdrop-blur rounded-xl px-6 py-3 font-body text-sm tracking-widest uppercase transition-all disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

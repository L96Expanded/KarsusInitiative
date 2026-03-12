import { useState } from 'react'
import { Pencil, Trash2, Heart, Shield, Sword, User } from 'lucide-react'
import type { Creature } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  alive:         'bg-green-900/40 text-green-400 border-green-800',
  unconscious:   'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  dead:          'bg-gray-900/40 text-gray-500 border-gray-700',
  concentrating: 'bg-blue-900/40 text-blue-400 border-blue-800',
  poisoned:      'bg-emerald-900/40 text-emerald-400 border-emerald-800',
  stunned:       'bg-orange-900/40 text-orange-400 border-orange-800',
  incapacitated: 'bg-red-900/40 text-red-400 border-red-800',
}

interface CreatureCardProps {
  creature: Creature
  isActive?: boolean
  onEdit?: () => void
  onDelete?: () => void
  compact?: boolean
}

export default function CreatureCard({
  creature,
  isActive,
  onEdit,
  onDelete,
  compact,
}: CreatureCardProps) {
  const [showActions, setShowActions] = useState(false)
  const statusStyle = STATUS_COLORS[creature.status] ?? 'bg-dnd-surface/40 text-dnd-muted border-dnd-border'
  const hpPct = creature.maxHp && creature.currentHp != null
    ? Math.max(0, Math.min(100, (creature.currentHp / creature.maxHp) * 100))
    : null

  return (
    <div
      className={cn(
        'relative dnd-card transition-all duration-300 group overflow-hidden',
        isActive && 'initiative-active',
        creature.status === 'dead' && 'opacity-50',
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Active turn indicator */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-dnd-gold rounded-l-xl" />
      )}

      <div className="flex items-center gap-3 p-3">
        {/* Token image */}
        <div className="relative flex-shrink-0">
          {creature.initiativeImageUrl ? (
            <img
              src={creature.initiativeImageUrl}
              alt={creature.name}
              className={cn(
                'rounded-full border-2 object-cover',
                compact ? 'w-10 h-10' : 'w-14 h-14',
                isActive ? 'border-dnd-gold' : 'border-dnd-border',
              )}
            />
          ) : (
            <div
              className={cn(
                'rounded-full border-2 flex items-center justify-center bg-dnd-dark',
                compact ? 'w-10 h-10' : 'w-14 h-14',
                isActive ? 'border-dnd-gold' : 'border-dnd-border',
              )}
            >
              {creature.isPlayer
                ? <User className="w-5 h-5 text-dnd-gold" />
                : <Sword className="w-5 h-5 text-dnd-muted" />
              }
            </div>
          )}
          {/* Initiative badge */}
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-dnd-crimson text-white text-[10px] font-bold flex items-center justify-center border border-dnd-dark">
            {creature.initiative}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('font-body text-sm font-medium truncate', isActive ? 'text-dnd-gold' : 'text-dnd-parchment')}>
              {creature.name}
            </span>
            <span className={cn('text-[10px] border rounded px-1.5 py-0.5 capitalize', statusStyle)}>
              {creature.status}
            </span>
          </div>

          {/* HP bar */}
          {hpPct !== null && !compact && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-dnd-dark rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-yellow-500' : 'bg-red-500',
                  )}
                  style={{ width: `${hpPct}%` }}
                />
              </div>
              <span className="text-[10px] text-dnd-muted whitespace-nowrap">
                {creature.currentHp}/{creature.maxHp}
              </span>
            </div>
          )}

          {/* Stats row */}
          {!compact && (
            <div className="flex items-center gap-3 mt-1">
              {creature.maxHp && (
                <span className="flex items-center gap-0.5 text-[11px] text-dnd-muted">
                  <Heart className="w-3 h-3 text-red-400" /> {creature.currentHp ?? creature.maxHp}
                </span>
              )}
              {creature.armorClass && (
                <span className="flex items-center gap-0.5 text-[11px] text-dnd-muted">
                  <Shield className="w-3 h-3 text-blue-400" /> {creature.armorClass}
                </span>
              )}
            </div>
          )}

          {creature.notes && !compact && (
            <p className="text-[11px] text-dnd-muted/70 italic truncate mt-0.5">{creature.notes}</p>
          )}
        </div>

        {/* Edit / Delete */}
        {(onEdit || onDelete) && (
          <div className={cn(
            'flex flex-col gap-1 transition-opacity duration-150',
            showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}>
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg text-dnd-muted hover:text-dnd-gold hover:bg-dnd-card transition-colors"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg text-dnd-muted hover:text-dnd-red hover:bg-dnd-card transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

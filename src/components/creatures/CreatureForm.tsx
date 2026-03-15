import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Creature, CreatureStatus } from '@/types'
import ImageUpload from '@/components/ui/ImageUpload'

const STATUSES: CreatureStatus[] = [
  'alive','unconscious','dead','concentrating','poisoned','stunned',
  'incapacitated','charmed','frightened','paralyzed','petrified',
  'blinded','deafened','invisible','prone','restrained','exhaustion',
]

const schema = z.object({
  name:       z.string().min(1, 'Name is required').max(80),
  initiative: z.coerce.number().int().min(-5).max(30),
  status:     z.enum(STATUSES as [CreatureStatus, ...CreatureStatus[]]),
  maxHp:      z.coerce.number().int().min(1).optional().or(z.literal('')),
  currentHp:  z.coerce.number().int().min(0).optional().or(z.literal('')),
  armorClass: z.coerce.number().int().min(1).max(30).optional().or(z.literal('')),
  notes:      z.string().max(500).optional(),
  isPlayer:   z.boolean().optional(),
  initiativeImageUrl: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface CreatureFormProps {
  initial?: Partial<Creature>
  onSubmit: (data: Omit<Creature, 'id'>) => void | Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function CreatureForm({ initial, onSubmit, onCancel, loading }: CreatureFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:       initial?.name ?? '',
      initiative: initial?.initiative ?? 10,
      status:     initial?.statuses?.[0] ?? 'alive',
      maxHp:      initial?.maxHp ?? '',
      currentHp:  initial?.currentHp ?? '',
      armorClass: initial?.armorClass ?? '',
      notes:      initial?.notes ?? '',
      isPlayer:   initial?.isPlayer ?? false,
      initiativeImageUrl: initial?.initiativeImageUrl ?? '',
    },
  })

  const imageUrl = watch('initiativeImageUrl')

  const submit = handleSubmit((raw) => {
    onSubmit({
      name: raw.name,
      initiative: raw.initiative,
      statuses:   raw.status !== 'alive' ? [raw.status] : [],
      maxHp:      raw.maxHp      !== '' ? Number(raw.maxHp)      : undefined,
      currentHp:  raw.currentHp  !== '' ? Number(raw.currentHp)  : undefined,
      armorClass: raw.armorClass !== '' ? Number(raw.armorClass) : undefined,
      notes:     raw.notes,
      isPlayer:  raw.isPlayer,
      initiativeImageUrl: raw.initiativeImageUrl || undefined,
    })
  })

  return (
    <form onSubmit={submit} className="p-6 space-y-5">
      {/* Image */}
      <ImageUpload
        label="Token / Avatar"
        value={imageUrl}
        onChange={(url) => setValue('initiativeImageUrl', url)}
      />

      {/* Name & Initiative */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="creature-name" className="dnd-label">Name *</label>
          <input {...register('name')} id="creature-name" className="dnd-input" placeholder="Goblin Chief" />
          {errors.name && <p className="mt-1 text-red-400 text-xs">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="creature-initiative" className="dnd-label">Initiative *</label>
          <input {...register('initiative')} id="creature-initiative" type="number" className="dnd-input" />
          {errors.initiative && <p className="mt-1 text-red-400 text-xs">{errors.initiative.message}</p>}
        </div>
      </div>

      {/* HP & AC */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="creature-maxHp" className="dnd-label">Max HP</label>
          <input {...register('maxHp')} id="creature-maxHp" type="number" className="dnd-input" placeholder="—" />
        </div>
        <div>
          <label htmlFor="creature-currentHp" className="dnd-label">Current HP</label>
          <input {...register('currentHp')} id="creature-currentHp" type="number" className="dnd-input" placeholder="—" />
        </div>
        <div>
          <label htmlFor="creature-armorClass" className="dnd-label">AC</label>
          <input {...register('armorClass')} id="creature-armorClass" type="number" className="dnd-input" placeholder="—" />
        </div>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="creature-status" className="dnd-label">Status</label>
        <select {...register('status')} id="creature-status" className="dnd-input capitalize">
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="creature-notes" className="dnd-label">Notes</label>
        <textarea
          {...register('notes')}
          id="creature-notes"
          rows={3}
          className="dnd-input resize-none"
          placeholder="Spells, traits, reminders…"
        />
      </div>

      {/* Is Player */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          {...register('isPlayer')}
          className="w-4 h-4 rounded accent-dnd-gold"
        />
        <span className="font-body text-sm text-dnd-parchment">Player Character (PC)</span>
      </label>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="dnd-button-secondary flex-1">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="dnd-button-primary flex-1">
          {loading ? 'Saving…' : initial?.name ? 'Save Changes' : 'Add Creature'}
        </button>
      </div>
    </form>
  )
}

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Trash2, User, Sword } from 'lucide-react'
import type { Creature, CreatureStatus } from '@/types'
import { cn } from '@/lib/utils'
import { uploadApi } from '@/api/upload'

const ALL_STATUSES: CreatureStatus[] = [
  'alive', 'unconscious', 'dead', 'concentrating', 'poisoned', 'stunned',
  'incapacitated', 'charmed', 'frightened', 'paralyzed', 'petrified',
  'blinded', 'deafened', 'invisible', 'prone', 'restrained', 'exhaustion',
]

interface CreatureRowProps {
  creature: Creature
  isActive?: boolean
  onSave: (data: Partial<Creature>) => void
  onDelete: () => void
}

export default function CreatureRow({ creature, isActive, onSave, onDelete }: CreatureRowProps) {
  const [nameEdit, setNameEdit]   = useState(false)
  const [nameDraft, setNameDraft] = useState(creature.name)
  const [initDraft, setInitDraft] = useState(String(creature.initiative))
  const [acDraft, setAcDraft]     = useState(String(creature.armorClass ?? ''))
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Sync drafts when creature changes from live sync updates
  useEffect(() => { setNameDraft(creature.name) }, [creature.name])
  useEffect(() => { setInitDraft(String(creature.initiative)) }, [creature.initiative])
  useEffect(() => { setAcDraft(String(creature.armorClass ?? '')) }, [creature.armorClass])

  function commitName() {
    const trimmed = nameDraft.trim()
    if (trimmed && trimmed !== creature.name) onSave({ name: trimmed })
    setNameEdit(false)
  }

  function commitInit() {
    const n = parseInt(initDraft, 10)
    if (!isNaN(n) && n !== creature.initiative) onSave({ initiative: n })
  }

  function commitAc() {
    const n = parseInt(acDraft, 10)
    if (!isNaN(n) && n !== creature.armorClass) onSave({ armorClass: n })
    else if (acDraft === '' && creature.armorClass !== undefined) onSave({ armorClass: undefined })
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadApi.uploadImage(file)
      onSave({ initiativeImageUrl: url })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // Shared avatar element factory (same markup used in both layouts)
  const avatar = (
    <div
      className="relative flex-shrink-0 cursor-pointer"
      onClick={() => fileRef.current?.click()}
      title="Change token image"
    >
      {creature.initiativeImageUrl ? (
        <img
          src={creature.initiativeImageUrl}
          alt={creature.name}
          className={cn(
            'w-7 h-7 rounded-full object-cover border',
            isActive ? 'border-dnd-gold' : 'border-dnd-border/60',
            uploading && 'opacity-50',
          )}
        />
      ) : (
        <div className={cn(
          'w-7 h-7 rounded-full border flex items-center justify-center bg-dnd-surface',
          isActive ? 'border-dnd-gold' : 'border-dnd-border/60',
        )}>
          {creature.isPlayer
            ? <User className="w-3.5 h-3.5 text-dnd-gold" />
            : <Sword className="w-3.5 h-3.5 text-dnd-muted" />
          }
        </div>
      )}
    </div>
  )

  const nameCell = nameEdit ? (
    <input
      autoFocus
      className="flex-1 min-w-0 bg-dnd-dark border border-dnd-gold/50 rounded px-1.5 py-0.5 text-sm text-dnd-parchment font-body focus:outline-none"
      value={nameDraft}
      onChange={(e) => setNameDraft(e.target.value)}
      onBlur={commitName}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commitName()
        if (e.key === 'Escape') { setNameDraft(creature.name); setNameEdit(false) }
      }}
    />
  ) : (
    <button
      className={cn(
        'flex-1 min-w-0 text-left text-sm font-body truncate hover:text-dnd-gold transition-colors',
        isActive ? 'text-dnd-gold font-semibold' : 'text-dnd-parchment',
      )}
      onClick={() => setNameEdit(true)}
      title="Click to edit name"
    >
      {creature.name}
    </button>
  )

  const statusSelect = (
    <select
      className="text-xs bg-dnd-dark border border-dnd-border/40 rounded px-1 py-0.5 text-dnd-parchment font-body focus:outline-none focus:border-dnd-gold/50 shrink-0"
      value={creature.status}
      onChange={(e) => onSave({ status: e.target.value as CreatureStatus })}
    >
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )

  const initiativeInput = (
    <input
      type="number"
      className="w-9 bg-dnd-dark border border-dnd-border/40 rounded px-1 py-0.5 text-center text-xs text-dnd-parchment font-body focus:outline-none focus:border-dnd-gold/50"
      title="Initiative"
      value={initDraft}
      onChange={(e) => setInitDraft(e.target.value)}
      onBlur={commitInit}
      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
    />
  )

  const pcCheckbox = (
    <label className="flex items-center gap-1 cursor-pointer text-xs text-dnd-muted shrink-0" title="Player Character">
      <input
        type="checkbox"
        checked={creature.isPlayer ?? false}
        onChange={(e) => onSave({ isPlayer: e.target.checked })}
        className="accent-dnd-gold w-3 h-3"
      />
      PC
    </label>
  )

  const uploadBtn = (
    <button
      onClick={() => fileRef.current?.click()}
      disabled={uploading}
      className="p-1 rounded text-dnd-muted hover:text-dnd-parchment transition-colors disabled:opacity-40"
      title="Upload token image"
    >
      <ImagePlus className="w-3.5 h-3.5" />
    </button>
  )

  const deleteBtn = (
    <button
      onClick={onDelete}
      className="p-1 rounded text-dnd-muted hover:!text-dnd-red transition-colors"
      title="Delete creature"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )

  return (
    <div className={cn(
      'group rounded-lg border transition-colors',
      isActive ? 'bg-dnd-gold/10 border-dnd-gold/50' : 'bg-dnd-dark/60 border-dnd-border/40',
      creature.status === 'dead' && 'opacity-50',
    )}>
      {/* Single hidden file input — shared by both layouts */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      {/* ──── MOBILE layout (below sm breakpoint) ──── */}
      <div className="sm:hidden flex flex-col px-3 py-2 gap-1.5">
        {/* Row 1: avatar  name  status */}
        <div className="flex items-center gap-2">
          {avatar}
          {nameCell}
          {statusSelect}
        </div>
        {/* Row 2: initiative  spacer  PC  upload  delete */}
        <div className="flex items-center gap-2 pl-9">
          {initiativeInput}
          <div className="flex-1" />
          {pcCheckbox}
          {uploadBtn}
          {deleteBtn}
        </div>
      </div>

      {/* ──── DESKTOP layout (sm and above) ──── */}
      <div className="hidden sm:flex items-center gap-2 px-3 h-11">
        {avatar}
        {nameCell}
        {initiativeInput}
        {/* Armor Class */}
        <input
          type="number"
          className="w-9 bg-dnd-dark border border-dnd-border/40 rounded px-1 py-0.5 text-center text-xs text-dnd-parchment font-body focus:outline-none focus:border-dnd-gold/50"
          title="Armor Class"
          placeholder="AC"
          value={acDraft}
          onChange={(e) => setAcDraft(e.target.value)}
          onBlur={commitAc}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
        />
        <div className="flex-1" />
        {uploadBtn}
        {pcCheckbox}
        <select
          className="max-w-[100px] text-xs bg-dnd-dark border border-dnd-border/40 rounded px-1 py-0.5 text-dnd-parchment font-body focus:outline-none focus:border-dnd-gold/50"
          value={creature.status}
          onChange={(e) => onSave({ status: e.target.value as CreatureStatus })}
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {deleteBtn}
      </div>
    </div>
  )
}

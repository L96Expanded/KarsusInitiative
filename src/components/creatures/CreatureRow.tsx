import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Trash2, User, Sword, Plus, X } from 'lucide-react'
import type { Creature, CreatureStatus } from '@/types'
import { cn } from '@/lib/utils'
import { uploadApi } from '@/api/upload'

/** Every addable condition (alive is implicit â€” never shown as a tag) */
const ADDABLE: CreatureStatus[] = [
  'unconscious', 'dead', 'concentrating', 'poisoned', 'stunned',
  'incapacitated', 'charmed', 'frightened', 'paralyzed', 'petrified',
  'blinded', 'deafened', 'invisible', 'prone', 'restrained', 'exhaustion',
]

/** Colour pill for each condition */
const STATUS_PILL: Record<string, string> = {
  dead:          'bg-gray-800/60    text-gray-300    border-gray-600/50',
  unconscious:   'bg-yellow-900/50  text-yellow-300  border-yellow-700/50',
  concentrating: 'bg-sky-900/50     text-sky-300     border-sky-700/50',
  poisoned:      'bg-lime-900/50    text-lime-300    border-lime-600/50',
  stunned:       'bg-orange-900/50  text-orange-300  border-orange-700/50',
  incapacitated: 'bg-red-900/50     text-red-300     border-red-700/50',
  charmed:       'bg-pink-900/50    text-pink-300    border-pink-600/50',
  frightened:    'bg-violet-900/50  text-violet-300  border-violet-700/50',
  paralyzed:     'bg-amber-900/50   text-amber-200   border-amber-600/50',
  petrified:     'bg-stone-700/50   text-stone-300   border-stone-500/50',
  blinded:       'bg-neutral-800/60 text-neutral-300 border-neutral-600/50',
  deafened:      'bg-slate-800/50   text-slate-300   border-slate-600/50',
  invisible:     'bg-cyan-900/50    text-cyan-300    border-cyan-700/50',
  prone:         'bg-amber-800/50   text-amber-300   border-amber-600/50',
  restrained:    'bg-rose-900/50    text-rose-300    border-rose-700/50',
  exhaustion:    'bg-indigo-900/50  text-indigo-300  border-indigo-700/50',
}

interface CreatureRowProps {
  creature: Creature
  isActive?: boolean
  onSave: (data: Partial<Creature>) => void
  onDelete: () => void
}

export default function CreatureRow({ creature, isActive, onSave, onDelete }: CreatureRowProps) {
  const [nameEdit, setNameEdit]     = useState(false)
  const [nameDraft, setNameDraft]   = useState(creature.name)
  const [initDraft, setInitDraft]   = useState(String(creature.initiative))
  const [acDraft, setAcDraft]       = useState(String(creature.armorClass ?? ''))
  const [uploading, setUploading]   = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const fileRef      = useRef<HTMLInputElement>(null)
  const statusRef    = useRef<HTMLDivElement>(null)

  // Sync drafts when creature changes from live sync updates
  useEffect(() => { setNameDraft(creature.name) },               [creature.name])
  useEffect(() => { setInitDraft(String(creature.initiative)) }, [creature.initiative])
  useEffect(() => { setAcDraft(String(creature.armorClass ?? '')) }, [creature.armorClass])

  // Close status dropdown on outside click
  useEffect(() => {
    if (!statusOpen) return
    function handle(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [statusOpen])

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

  function addStatus(s: CreatureStatus) {
    const current = creature.statuses ?? []
    if (!current.includes(s)) onSave({ statuses: [...current.filter(x => x !== 'alive'), s] })
    setStatusOpen(false)
  }

  function removeStatus(s: CreatureStatus) {
    const next = (creature.statuses ?? []).filter(x => x !== s)
    onSave({ statuses: next.length === 0 ? [] : next })
  }

  const activeStatuses = (creature.statuses ?? []).filter(s => s !== 'alive') as CreatureStatus[]
  const available      = ADDABLE.filter(s => !activeStatuses.includes(s))
  const isDead         = activeStatuses.includes('dead')

  // â”€â”€ Shared sub-elements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  const statusTags = (
    <div ref={statusRef} className="relative flex items-center gap-1 flex-wrap">
      {activeStatuses.map(s => (
        <span
          key={s}
          className={cn(
            'inline-flex items-center gap-0.5 text-[10px] border rounded px-1 py-px leading-tight capitalize',
            STATUS_PILL[s] ?? 'bg-dnd-surface/50 text-dnd-muted border-dnd-border/40',
          )}
        >
          {s}
          <button
            type="button"
            onClick={() => removeStatus(s)}
            className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
            title={`Remove ${s}`}
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
      {available.length > 0 && (
        <button
          type="button"
          onClick={() => setStatusOpen(v => !v)}
          className="inline-flex items-center justify-center w-5 h-5 rounded border border-dnd-border/40 text-dnd-muted hover:text-dnd-parchment hover:border-dnd-border transition-colors"
          title="Add condition"
        >
          <Plus className="w-3 h-3" />
        </button>
      )}
      {statusOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-dnd-dark border border-dnd-border rounded-lg py-1 w-36 shadow-xl max-h-48 overflow-y-auto">
          {available.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => addStatus(s)}
              className="w-full text-left px-3 py-1 text-xs text-dnd-parchment hover:bg-dnd-surface/60 transition-colors capitalize"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
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
      type="button"
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
      type="button"
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
      isDead && 'opacity-50',
    )}>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      {/* â”€â”€ MOBILE layout â”€â”€ */}
      <div className="sm:hidden flex flex-col px-3 py-2 gap-1.5">
        <div className="flex items-center gap-2">
          {avatar}
          {nameCell}
        </div>
        <div className="flex items-center gap-2 pl-9 flex-wrap">
          {initiativeInput}
          <div className="flex-1 min-w-0">{statusTags}</div>
          {pcCheckbox}
          {uploadBtn}
          {deleteBtn}
        </div>
      </div>

      {/* â”€â”€ DESKTOP layout â”€â”€ */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 min-h-[2.75rem]">
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
        {statusTags}
        <div className="flex-1" />
        {uploadBtn}
        {pcCheckbox}
        {deleteBtn}
      </div>
    </div>
  )
}

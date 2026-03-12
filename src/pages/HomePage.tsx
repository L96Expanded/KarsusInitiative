import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Swords, BookOpen, Trash2, Pencil, ChevronRight, Play } from 'lucide-react'
import toast from 'react-hot-toast'

import Layout from '@/components/ui/Layout'
import Modal from '@/components/ui/Modal'
import ConfirmDelete from '@/components/ui/ConfirmDelete'
import EncounterForm from '@/components/encounters/EncounterForm'
import PresetForm from '@/components/presets/PresetForm'

import { encountersApi } from '@/api/encounters'
import { presetsApi } from '@/api/presets'
import type { Encounter, Preset } from '@/types'

// ─── Encounter card ───────────────────────────────────────────────────────────
function EncounterCard({
  encounter,
  onEdit,
  onDelete,
  onClick,
}: {
  encounter: Encounter
  onEdit: () => void
  onDelete: () => void
  onClick: () => void
}) {
  return (
    <div
      className="dnd-card overflow-hidden cursor-pointer group hover:border-dnd-teal/60 hover:shadow-glow-teal transition-all duration-300"
      onClick={onClick}
    >
      {/* Background image — tall, image-forward strip */}
      <div className="h-40 relative overflow-hidden">
        {encounter.backgroundImageUrl ? (
          <img src={encounter.backgroundImageUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-dnd-dark bg-dragon-scale" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dnd-card via-dnd-card/30 to-transparent" />

        {/* Action buttons — on hover over image */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit}   className="p-1.5 rounded bg-dnd-black/70 text-dnd-muted hover:text-dnd-gold backdrop-blur transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1.5 rounded bg-dnd-black/70 text-dnd-muted hover:text-dnd-red backdrop-blur transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>

        <span className="absolute bottom-2 left-3 text-[10px] font-body text-dnd-amber/80 tracking-widest bg-dnd-black/50 backdrop-blur-sm px-2 py-0.5 rounded">
          ROUND {encounter.currentRound} · {encounter.creatures.length} CREATURES
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-body text-dnd-parchment font-medium truncate group-hover:text-dnd-gold transition-colors">
          {encounter.title}
        </h3>
        {encounter.description && (
          <p className="text-xs text-dnd-muted/80 mt-0.5 line-clamp-2 font-ui">{encounter.description}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex -space-x-1.5">
            {encounter.creatures.slice(0, 5).map((c) => (
              c.initiativeImageUrl
                ? <img key={c.id} src={c.initiativeImageUrl} alt={c.name} className="w-7 h-7 rounded-full border-2 border-dnd-card object-cover" />
                : <div key={c.id} className="w-7 h-7 rounded-full border-2 border-dnd-card bg-dnd-surface flex items-center justify-center">
                    <Swords className="w-3 h-3 text-dnd-muted" />
                  </div>
            ))}
            {encounter.creatures.length > 5 && (
              <div className="w-7 h-7 rounded-full border-2 border-dnd-card bg-dnd-surface flex items-center justify-center text-[9px] text-dnd-muted">
                +{encounter.creatures.length - 5}
              </div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-dnd-muted group-hover:text-dnd-gold transition-colors" />
        </div>
      </div>
    </div>
  )
}

// ─── Preset card ──────────────────────────────────────────────────────────────
function PresetCard({
  preset,
  onEdit,
  onDelete,
  onClick,
  onLaunch,
}: {
  preset: Preset
  onEdit: () => void
  onDelete: () => void
  onClick: () => void
  onLaunch: () => void
}) {
  return (
    <div
      className="dnd-card overflow-hidden cursor-pointer group hover:border-dnd-gold/60 hover:shadow-glow-gold transition-all duration-300"
      onClick={onClick}
    >
      <div className="h-40 relative overflow-hidden">
        {preset.backgroundImageUrl ? (
          <img src={preset.backgroundImageUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-dnd-dark bg-dragon-scale" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dnd-card via-dnd-card/30 to-transparent" />

        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit}   className="p-1.5 rounded bg-dnd-black/70 text-dnd-muted hover:text-dnd-gold backdrop-blur transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1.5 rounded bg-dnd-black/70 text-dnd-muted hover:text-dnd-red backdrop-blur transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>

        <span className="absolute bottom-2 left-3 text-[10px] font-body text-dnd-amber/80 tracking-widest bg-dnd-black/50 backdrop-blur-sm px-2 py-0.5 rounded">
          {preset.creatures.length} CREATURES
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-body text-dnd-parchment font-medium truncate group-hover:text-dnd-gold transition-colors">
          {preset.name}
        </h3>
        {preset.description && (
          <p className="text-xs text-dnd-muted/80 mt-0.5 line-clamp-2 font-ui">{preset.description}</p>
        )}

        <div className="flex items-center justify-between mt-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex -space-x-1.5">
            {preset.creatures.slice(0, 5).map((c) => (
              c.initiativeImageUrl
                ? <img key={c.id} src={c.initiativeImageUrl} alt={c.name} className="w-7 h-7 rounded-full border-2 border-dnd-card object-cover" />
                : <div key={c.id} className="w-7 h-7 rounded-full border-2 border-dnd-card bg-dnd-surface flex items-center justify-center">
                    <Swords className="w-3 h-3 text-dnd-muted" />
                  </div>
            ))}
          </div>
          <button
            onClick={onLaunch}
            className="flex items-center gap-1.5 text-xs font-body tracking-widest text-dnd-gold border border-dnd-gold/40 hover:bg-dnd-gold/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Play className="w-3 h-3" /> Launch
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  // Queries
  const { data: encounters = [], isLoading: loadingEnc } = useQuery({
    queryKey: ['encounters'],
    queryFn: encountersApi.list,
  })
  const { data: presets = [], isLoading: loadingPre } = useQuery({
    queryKey: ['presets'],
    queryFn: presetsApi.list,
  })

  // Modals state
  const [encModal, setEncModal]     = useState<{ open: boolean; editing?: Encounter }>({ open: false })
  const [preModal, setPreModal]     = useState<{ open: boolean; editing?: Preset }>({ open: false })
  const [delEnc, setDelEnc]         = useState<Encounter | null>(null)
  const [delPre, setDelPre]         = useState<Preset | null>(null)

  // Mutations – Encounters
  const createEnc = useMutation({
    mutationFn: encountersApi.create,
    onSuccess: (enc) => { qc.invalidateQueries({ queryKey: ['encounters'] }); setEncModal({ open: false }); navigate(`/encounters/${enc.id}`) },
    onError: (e: Error) => toast.error(e.message),
  })
  const updateEnc = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof encountersApi.update>[1] }) =>
      encountersApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['encounters'] }); setEncModal({ open: false }); toast.success('Encounter updated') },
    onError: (e: Error) => toast.error(e.message),
  })
  const deleteEnc = useMutation({
    mutationFn: encountersApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['encounters'] }); setDelEnc(null); toast.success('Encounter deleted') },
    onError: (e: Error) => toast.error(e.message),
  })

  // Mutations – Presets
  const createPre = useMutation({
    mutationFn: presetsApi.create,
    onSuccess: (pre) => { qc.invalidateQueries({ queryKey: ['presets'] }); setPreModal({ open: false }); navigate(`/presets/${pre.id}`) },
    onError: (e: Error) => toast.error(e.message),
  })
  const updatePre = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof presetsApi.update>[1] }) =>
      presetsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['presets'] }); setPreModal({ open: false }); toast.success('Preset updated') },
    onError: (e: Error) => toast.error(e.message),
  })
  const deletePre = useMutation({
    mutationFn: presetsApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['presets'] }); setDelPre(null); toast.success('Preset deleted') },
    onError: (e: Error) => toast.error(e.message),
  })
  const launchPreset = useMutation({
    mutationFn: encountersApi.createFromPreset,
    onSuccess: (enc) => { qc.invalidateQueries({ queryKey: ['encounters'] }); navigate(`/encounters/${enc.id}`) },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <Layout>
      <div className="space-y-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl text-center py-14 px-6">
          {/* Faint stone backdrop */}
          <div className="absolute inset-0 bg-dragon-scale opacity-60 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-dnd-teal/5 via-transparent to-dnd-gold/5 rounded-2xl" />
          <div className="relative">
            <p className="font-body text-dnd-amber/60 text-xs tracking-[0.4em] uppercase mb-3">Battle Command</p>
            <h1 className="font-display text-4xl sm:text-5xl text-dnd-gold tracking-widest mb-2">
              KARSUS INITIATIVE
            </h1>
            <p className="font-ui italic text-dnd-muted text-base">Lead every charge. Track every turn.</p>
          </div>
        </div>

        {/* ── Encounters ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-dnd-crimson" />
              <h2 className="font-body text-xl text-dnd-parchment tracking-widest uppercase">Encounters</h2>
              <span className="ml-1 text-xs text-dnd-muted bg-dnd-surface px-2 py-0.5 rounded-full">{encounters.length}</span>
            </div>
            <button onClick={() => setEncModal({ open: true })} className="dnd-button-primary flex items-center gap-2 py-2 px-4">
              <Plus className="w-4 h-4" /> New Encounter
            </button>
          </div>

          {loadingEnc ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-40 dnd-card animate-pulse" />)}
            </div>
          ) : encounters.length === 0 ? (
            <div className="dnd-card p-10 text-center">
              <Swords className="w-10 h-10 text-dnd-muted/40 mx-auto mb-3" />
              <p className="text-dnd-muted font-ui italic">No encounters yet. Create your first battle!</p>
              <button onClick={() => setEncModal({ open: true })} className="dnd-button-secondary mt-4 inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Create Encounter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {encounters.map((enc) => (
                <EncounterCard
                  key={enc.id}
                  encounter={enc}
                  onClick={() => navigate(`/encounters/${enc.id}`)}
                  onEdit={() => setEncModal({ open: true, editing: enc })}
                  onDelete={() => setDelEnc(enc)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Presets ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-dnd-gold" />
              <h2 className="font-body text-xl text-dnd-parchment tracking-widest uppercase">Presets</h2>
              <span className="ml-1 text-xs text-dnd-muted bg-dnd-surface px-2 py-0.5 rounded-full">{presets.length}</span>
            </div>
            <button onClick={() => setPreModal({ open: true })} className="dnd-button-secondary flex items-center gap-2 py-2 px-4">
              <Plus className="w-4 h-4" /> New Preset
            </button>
          </div>

          {loadingPre ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-40 dnd-card animate-pulse" />)}
            </div>
          ) : presets.length === 0 ? (
            <div className="dnd-card p-10 text-center">
              <BookOpen className="w-10 h-10 text-dnd-muted/40 mx-auto mb-3" />
              <p className="text-dnd-muted font-ui italic">No presets yet. Save encounter templates here!</p>
              <button onClick={() => setPreModal({ open: true })} className="dnd-button-secondary mt-4 inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Create Preset
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {presets.map((pre) => (
                <PresetCard
                  key={pre.id}
                  preset={pre}
                  onClick={() => navigate(`/presets/${pre.id}`)}
                  onEdit={() => setPreModal({ open: true, editing: pre })}
                  onDelete={() => setDelPre(pre)}
                  onLaunch={() => launchPreset.mutate(pre.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}

      {/* Encounter create/edit */}
      <Modal
        open={encModal.open}
        onClose={() => setEncModal({ open: false })}
        title={encModal.editing ? 'Edit Encounter' : 'New Encounter'}
      >
        <EncounterForm
          initial={encModal.editing}
          onCancel={() => setEncModal({ open: false })}
          loading={createEnc.isPending || updateEnc.isPending}
          onSubmit={(data) => {
            if (encModal.editing) updateEnc.mutate({ id: encModal.editing.id, data })
            else createEnc.mutate(data)
          }}
        />
      </Modal>

      {/* Preset create/edit */}
      <Modal
        open={preModal.open}
        onClose={() => setPreModal({ open: false })}
        title={preModal.editing ? 'Edit Preset' : 'New Preset'}
      >
        <PresetForm
          initial={preModal.editing}
          onCancel={() => setPreModal({ open: false })}
          loading={createPre.isPending || updatePre.isPending}
          onSubmit={(data) => {
            if (preModal.editing) updatePre.mutate({ id: preModal.editing.id, data })
            else createPre.mutate(data)
          }}
        />
      </Modal>

      {/* Delete confirmations */}
      <ConfirmDelete
        open={!!delEnc}
        onClose={() => setDelEnc(null)}
        onConfirm={() => delEnc && deleteEnc.mutate(delEnc.id)}
        name={delEnc?.title ?? ''}
        loading={deleteEnc.isPending}
      />
      <ConfirmDelete
        open={!!delPre}
        onClose={() => setDelPre(null)}
        onConfirm={() => delPre && deletePre.mutate(delPre.id)}
        name={delPre?.name ?? ''}
        loading={deletePre.isPending}
      />
    </Layout>
  )
}

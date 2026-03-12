import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Plus, Play } from 'lucide-react'
import toast from 'react-hot-toast'

import Layout from '@/components/ui/Layout'
import Modal from '@/components/ui/Modal'
import ConfirmDelete from '@/components/ui/ConfirmDelete'
import CreatureCard from '@/components/creatures/CreatureCard'
import CreatureForm from '@/components/creatures/CreatureForm'
import PresetForm from '@/components/presets/PresetForm'

import { presetsApi } from '@/api/presets'
import { encountersApi } from '@/api/encounters'
import type { Creature } from '@/types'

export default function PresetPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [creatureModal, setCreatureModal] = useState<{ open: boolean; editing?: Creature }>({ open: false })
  const [editModal,      setEditModal]    = useState(false)
  const [deleteCreature, setDeleteCreature] = useState<Creature | null>(null)

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: preset, isLoading, error } = useQuery({
    queryKey: ['presets', id],
    queryFn: () => presetsApi.get(id!),
    enabled: !!id,
  })

  // ── Mutations ─────────────────────────────────────────────────────────────
  const updatePre = useMutation({
    mutationFn: (data: Parameters<typeof presetsApi.update>[1]) => presetsApi.update(id!, data),
    onSuccess: (updated) => {
      qc.setQueryData(['presets', id], updated)
      qc.invalidateQueries({ queryKey: ['presets'] })
      setEditModal(false)
      toast.success('Preset updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const addCreature = useMutation({
    mutationFn: (data: Parameters<typeof presetsApi.addCreature>[1]) => presetsApi.addCreature(id!, data),
    onSuccess: (updated) => {
      qc.setQueryData(['presets', id], updated)
      setCreatureModal({ open: false })
      toast.success('Creature added')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const editCreature = useMutation({
    mutationFn: ({ cid, data }: { cid: string; data: Partial<Creature> }) =>
      presetsApi.updateCreature(id!, cid, data),
    onSuccess: (updated) => {
      qc.setQueryData(['presets', id], updated)
      setCreatureModal({ open: false })
      toast.success('Creature updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const delCreature = useMutation({
    mutationFn: (cid: string) => presetsApi.deleteCreature(id!, cid),
    onSuccess: (updated) => {
      qc.setQueryData(['presets', id], updated)
      setDeleteCreature(null)
      toast.success('Creature removed')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const launchPreset = useMutation({
    mutationFn: () => encountersApi.createFromPreset(id!),
    onSuccess: (enc) => {
      qc.invalidateQueries({ queryKey: ['encounters'] })
      toast.success('Encounter created from preset!')
      navigate(`/encounters/${enc.id}`)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-dnd-gold font-body tracking-widest animate-pulse">Loading preset…</div>
        </div>
      </Layout>
    )
  }

  if (error || !preset) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-dnd-red font-body">Preset not found.</p>
          <button onClick={() => navigate('/')} className="dnd-button-secondary mt-4">← Back</button>
        </div>
      </Layout>
    )
  }

  const sorted = [...preset.creatures].sort((a, b) => b.initiative - a.initiative)

  return (
    <Layout title={preset.name}>
      {preset.backgroundImageUrl && (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-5">
          <img src={preset.backgroundImageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4 flex-wrap">
          <button onClick={() => navigate('/')} className="dnd-button-ghost flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />Back
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-body tracking-widest text-dnd-gold/50 uppercase">Preset</span>
            </div>
            <h1 className="font-display text-3xl text-dnd-gold truncate">{preset.name}</h1>
            {preset.description && (
              <p className="text-dnd-muted font-ui italic mt-1">{preset.description}</p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setEditModal(true)} className="dnd-button-secondary py-2 px-4 text-sm">
              Edit Preset
            </button>
            <button
              onClick={() => launchPreset.mutate()}
              disabled={launchPreset.isPending}
              className="dnd-button-primary py-2 px-4 text-sm flex items-center gap-1.5"
            >
              <Play className="w-4 h-4" />
              {launchPreset.isPending ? 'Launching…' : 'Launch Encounter'}
            </button>
          </div>
        </div>

        {/* Info card */}
        <div className="dnd-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dnd-muted text-xs font-body tracking-widest uppercase">Template Creatures</p>
              <p className="text-dnd-gold font-display text-2xl">{sorted.length}</p>
            </div>
            <p className="text-dnd-muted text-sm font-ui italic">
              Launching will create a new encounter with all these creatures.
            </p>
          </div>
        </div>

        {/* Creatures list */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-body text-lg text-dnd-parchment tracking-widest uppercase">
              Creatures <span className="text-dnd-muted text-sm">({sorted.length})</span>
            </h2>
            <button
              onClick={() => setCreatureModal({ open: true })}
              className="dnd-button-secondary flex items-center gap-1.5 py-1.5 px-3 text-sm"
            >
              <Plus className="w-4 h-4" /> Add Creature
            </button>
          </div>

          {sorted.length === 0 ? (
            <div className="dnd-card p-10 text-center">
              <p className="text-dnd-muted font-ui italic">No creatures yet. Build your template!</p>
              <button
                onClick={() => setCreatureModal({ open: true })}
                className="dnd-button-secondary mt-4 inline-flex items-center gap-1.5 text-sm"
              >
                <Plus className="w-4 h-4" /> Add Creature
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((creature) => (
                <CreatureCard
                  key={creature.id}
                  creature={creature}
                  onEdit={() => setCreatureModal({ open: true, editing: creature })}
                  onDelete={() => setDeleteCreature(creature)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}

      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Preset">
        <PresetForm
          initial={preset}
          onCancel={() => setEditModal(false)}
          loading={updatePre.isPending}
          onSubmit={(data) => updatePre.mutate(data)}
        />
      </Modal>

      <Modal
        open={creatureModal.open}
        onClose={() => setCreatureModal({ open: false })}
        title={creatureModal.editing ? 'Edit Creature' : 'Add Creature'}
        size="lg"
      >
        <CreatureForm
          initial={creatureModal.editing}
          onCancel={() => setCreatureModal({ open: false })}
          loading={addCreature.isPending || editCreature.isPending}
          onSubmit={(data) => {
            if (creatureModal.editing) {
              editCreature.mutate({ cid: creatureModal.editing.id, data })
            } else {
              addCreature.mutate(data)
            }
          }}
        />
      </Modal>

      <ConfirmDelete
        open={!!deleteCreature}
        onClose={() => setDeleteCreature(null)}
        onConfirm={() => deleteCreature && delCreature.mutate(deleteCreature.id)}
        name={deleteCreature?.name ?? ''}
        loading={delCreature.isPending}
      />
    </Layout>
  )
}

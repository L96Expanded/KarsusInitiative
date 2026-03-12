import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Plus, ChevronRight, ChevronLeftIcon, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

import Layout from '@/components/ui/Layout'
import Modal from '@/components/ui/Modal'
import ConfirmDelete from '@/components/ui/ConfirmDelete'
import CreatureCard from '@/components/creatures/CreatureCard'
import CreatureForm from '@/components/creatures/CreatureForm'
import EncounterForm from '@/components/encounters/EncounterForm'

import { encountersApi } from '@/api/encounters'
import { useEncounterLive } from '@/hooks/useEncounterLive'
import type { Creature } from '@/types'

export default function EncounterPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [creatureModal, setCreatureModal] = useState<{ open: boolean; editing?: Creature }>({ open: false })
  const [editModal,     setEditModal]     = useState(false)
  const [deleteCreature,setDeleteCreature]= useState<Creature | null>(null)

  const openVisualView = () => {
    window.open(
      `/encounters/${id}/view`,
      'encounter-visual-view',
      'width=1280,height=800,menubar=no,toolbar=no,location=no,status=no',
    )
  }

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: encounter, isLoading, error } = useQuery({
    queryKey: ['encounters', id],
    queryFn: () => encountersApi.get(id!),
    enabled: !!id,
  })

  // ── Real-time sync ────────────────────────────────────────────────────────
  // Patches the local cache when another device (e.g. phone) makes a change
  useEncounterLive(id, (enc) => {
    qc.setQueryData(['encounters', id], enc)
  })

  // ── Mutations ─────────────────────────────────────────────────────────────
  const updateEnc = useMutation({
    mutationFn: (data: Parameters<typeof encountersApi.update>[1]) => encountersApi.update(id!, data),
    onSuccess: (updated) => {
      qc.setQueryData(['encounters', id], updated)
      qc.invalidateQueries({ queryKey: ['encounters'] })
      setEditModal(false)
      toast.success('Encounter updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const addCreature = useMutation({
    mutationFn: (data: Parameters<typeof encountersApi.addCreature>[1]) =>
      encountersApi.addCreature(id!, data),
    onSuccess: (updated) => {
      qc.setQueryData(['encounters', id], updated)
      setCreatureModal({ open: false })
      toast.success('Creature added')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const editCreature = useMutation({
    mutationFn: ({ cid, data }: { cid: string; data: Partial<Creature> }) =>
      encountersApi.updateCreature(id!, cid, data),
    onSuccess: (updated) => {
      qc.setQueryData(['encounters', id], updated)
      setCreatureModal({ open: false })
      toast.success('Creature updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const delCreature = useMutation({
    mutationFn: (cid: string) => encountersApi.deleteCreature(id!, cid),
    onSuccess: (updated) => {
      qc.setQueryData(['encounters', id], updated)
      setDeleteCreature(null)
      toast.success('Creature removed')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const nextTurn = useMutation({
    mutationFn: () => encountersApi.nextTurn(id!),
    onSuccess: (ts) => {
      qc.setQueryData(['encounters', id], (old: typeof encounter) =>
        old ? { ...old, ...ts } : old,
      )
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const prevTurn = useMutation({
    mutationFn: () => encountersApi.prevTurn(id!),
    onSuccess: (ts) => {
      qc.setQueryData(['encounters', id], (old: typeof encounter) =>
        old ? { ...old, ...ts } : old,
      )
    },
    onError: (e: Error) => toast.error(e.message),
  })

  // ── Loading / Error states ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-dnd-gold font-body tracking-widest animate-pulse">Loading encounter…</div>
        </div>
      </Layout>
    )
  }

  if (error || !encounter) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-dnd-red font-body">Encounter not found.</p>
          <button onClick={() => navigate('/')} className="dnd-button-secondary mt-4">← Back</button>
        </div>
      </Layout>
    )
  }

  const sorted = [...encounter.creatures].sort((a, b) => b.initiative - a.initiative)
  const activeCreature = sorted[encounter.currentTurn]

  return (
    <Layout title={encounter.title}>
      {/* Background image — subtle ambient presence */}
      {encounter.backgroundImageUrl && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <img src={encounter.backgroundImageUrl} alt="" className="w-full h-full object-cover opacity-[0.12]" />
          <div className="absolute inset-0 bg-gradient-to-b from-dnd-black/60 via-transparent to-dnd-black/80" />
        </div>
      )}

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4 flex-wrap">
          <button onClick={() => navigate('/')} className="dnd-button-ghost flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />Back
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl text-dnd-gold truncate">{encounter.title}</h1>
            {encounter.description && (
              <p className="text-dnd-muted font-ui italic mt-1">{encounter.description}</p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setEditModal(true)} className="dnd-button-secondary py-2 px-4 text-sm flex items-center gap-1.5">
              Edit
            </button>
            <button
              onClick={openVisualView}
              disabled={encounter.creatures.length === 0}
              className="dnd-button-primary py-2 px-4 text-sm flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" /> Visual View
            </button>
          </div>
        </div>

        {/* Round / Turn controls */}
        <div className="dnd-card p-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-dnd-muted text-xs font-body tracking-widest">ROUND</p>
              <p className="text-dnd-gold font-display text-3xl">{encounter.currentRound}</p>
            </div>
            <div className="text-center">
              <p className="text-dnd-muted text-xs font-body tracking-widest">TURN</p>
              <p className="text-dnd-parchment font-display text-3xl">
                {encounter.creatures.length > 0 ? encounter.currentTurn + 1 : 0}
                <span className="text-dnd-muted text-lg">/{sorted.length}</span>
              </p>
            </div>
            {activeCreature && (
              <div>
                <p className="text-dnd-muted text-xs font-body tracking-widest">ACTIVE</p>
                <p className="text-dnd-parchment font-body">{activeCreature.name}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => prevTurn.mutate()}
              disabled={prevTurn.isPending || encounter.creatures.length === 0}
              className="dnd-button-secondary flex items-center gap-1.5 py-2 px-4"
            >
              <ChevronLeftIcon className="w-4 h-4" /> Prev Turn
            </button>
            <button
              onClick={() => nextTurn.mutate()}
              disabled={nextTurn.isPending || encounter.creatures.length === 0}
              className="dnd-button-primary flex items-center gap-1.5 py-2 px-4"
            >
              Next Turn <ChevronRight className="w-4 h-4" />
            </button>
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
              <p className="text-dnd-muted font-ui italic">No creatures yet. Add the combatants!</p>
              <button
                onClick={() => setCreatureModal({ open: true })}
                className="dnd-button-secondary mt-4 inline-flex items-center gap-1.5 text-sm"
              >
                <Plus className="w-4 h-4" /> Add Creature
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((creature, i) => (
                <CreatureCard
                  key={creature.id}
                  creature={creature}
                  isActive={i === encounter.currentTurn}
                  onEdit={() => setCreatureModal({ open: true, editing: creature })}
                  onDelete={() => setDeleteCreature(creature)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}

      {/* Edit encounter */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Encounter">
        <EncounterForm
          initial={encounter}
          onCancel={() => setEditModal(false)}
          loading={updateEnc.isPending}
          onSubmit={(data) => updateEnc.mutate(data)}
        />
      </Modal>

      {/* Add / edit creature */}
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

      {/* Delete creature */}
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

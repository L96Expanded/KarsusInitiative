import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Encounter } from '@/types'
import ImageUpload from '@/components/ui/ImageUpload'

const schema = z.object({
  title:       z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  backgroundImageUrl: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface EncounterFormProps {
  initial?: Partial<Encounter>
  onSubmit: (data: FormData) => void | Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function EncounterForm({ initial, onSubmit, onCancel, loading }: EncounterFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:       initial?.title ?? '',
      description: initial?.description ?? '',
      backgroundImageUrl: initial?.backgroundImageUrl ?? '',
    },
  })

  const bgUrl = watch('backgroundImageUrl')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
      <div>
        <label htmlFor="encounter-title" className="dnd-label">Title *</label>
        <input {...register('title')} id="encounter-title" className="dnd-input" placeholder="The Final Showdown" />
        {errors.title && <p className="mt-1 text-red-400 text-xs">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="encounter-description" className="dnd-label">Description</label>
        <textarea
          {...register('description')}
          id="encounter-description"
          rows={3}
          className="dnd-input resize-none"
          placeholder="A brief description of this encounter…"
        />
      </div>

      <ImageUpload
        label="Background Image"
        value={bgUrl}
        onChange={(url) => setValue('backgroundImageUrl', url)}
      />

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="dnd-button-secondary flex-1">Cancel</button>
        <button type="submit" disabled={loading} className="dnd-button-primary flex-1">
          {loading ? 'Saving…' : initial?.title ? 'Save Changes' : 'Create Encounter'}
        </button>
      </div>
    </form>
  )
}

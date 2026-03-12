import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Preset } from '@/types'
import ImageUpload from '@/components/ui/ImageUpload'

const schema = z.object({
  name:        z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  backgroundImageUrl: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface PresetFormProps {
  initial?: Partial<Preset>
  onSubmit: (data: FormData) => void | Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function PresetForm({ initial, onSubmit, onCancel, loading }: PresetFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:        initial?.name ?? '',
      description: initial?.description ?? '',
      backgroundImageUrl: initial?.backgroundImageUrl ?? '',
    },
  })

  const bgUrl = watch('backgroundImageUrl')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
      <div>
        <label htmlFor="preset-name" className="dnd-label">Preset Name *</label>
        <input {...register('name')} id="preset-name" className="dnd-input" placeholder="Goblin Ambush" />
        {errors.name && <p className="mt-1 text-red-400 text-xs">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="preset-description" className="dnd-label">Description</label>
        <textarea
          {...register('description')}
          id="preset-description"
          rows={3}
          className="dnd-input resize-none"
          placeholder="Describe this preset encounter setup…"
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
          {loading ? 'Saving…' : initial?.name ? 'Save Changes' : 'Create Preset'}
        </button>
      </div>
    </form>
  )
}

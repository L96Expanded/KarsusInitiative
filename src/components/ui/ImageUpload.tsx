import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2 } from 'lucide-react'
import { uploadApi } from '@/api/upload'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
}

export default function ImageUpload({ value, onChange, label = 'Image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB')
      return
    }
    setUploading(true)
    try {
      const { url } = await uploadApi.uploadImage(file)
      onChange(url)
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }, [onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] },
    multiple: false,
    disabled: uploading,
  })

  return (
    <div>
      <label className="dnd-label">{label}</label>
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-40 object-cover rounded-lg border border-dnd-border"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
            <div {...getRootProps()} className="cursor-pointer">
              <input {...getInputProps()} />
              <button type="button" className="p-2 rounded-full bg-dnd-surface text-dnd-parchment hover:bg-dnd-card">
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 rounded-full bg-dnd-crimson/80 text-white hover:bg-dnd-red"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-dnd-gold bg-dnd-gold/5'
              : 'border-dnd-border hover:border-dnd-purple hover:bg-dnd-surface/50'
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-dnd-muted">
              <Loader2 className="w-8 h-8 animate-spin text-dnd-gold" />
              <span className="text-sm font-ui">Uploading…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-dnd-muted">
              <Upload className="w-8 h-8" />
              <span className="text-sm font-ui">
                {isDragActive ? 'Drop here…' : 'Click or drag to upload'}
              </span>
              <span className="text-xs opacity-60">PNG, JPG, WEBP up to 5 MB</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

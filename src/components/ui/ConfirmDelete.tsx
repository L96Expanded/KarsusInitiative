import { Trash2, AlertCircle } from 'lucide-react'
import Modal from './Modal'

interface ConfirmDeleteProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  name: string
  loading?: boolean
}

export default function ConfirmDelete({ open, onClose, onConfirm, name, loading }: ConfirmDeleteProps) {
  return (
    <Modal open={open} onClose={onClose} title="Confirm Delete" size="sm">
      <div className="p-6 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-dnd-crimson/15 border border-dnd-crimson flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-dnd-red" />
        </div>
        <p className="font-ui text-dnd-parchment">
          Are you sure you want to delete <span className="text-dnd-gold font-body">"{name}"</span>?
          <br />
          <span className="text-dnd-muted text-sm">This cannot be undone.</span>
        </p>
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="dnd-button-secondary flex-1">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-dnd-crimson hover:bg-dnd-red text-white font-body tracking-wider px-6 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

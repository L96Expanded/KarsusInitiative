import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const sizeClass = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-[95vw] max-h-[95vh]',
}

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={`relative w-full ${sizeClass[size]} bg-dnd-surface border border-dnd-border rounded-2xl shadow-card overflow-hidden`}
            initial={{ scale: 0.95, y: -10, opacity: 0 }}
            animate={{ scale: 1,    y: 0,   opacity: 1 }}
            exit={{    scale: 0.95, y: -10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-dnd-border">
                <h2 className="font-body text-dnd-gold text-lg tracking-widest uppercase">{title}</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg text-dnd-muted hover:text-dnd-parchment hover:bg-dnd-card transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-dnd-card/80 text-dnd-muted hover:text-dnd-parchment transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Body */}
            <div className={`overflow-y-auto ${size === 'full' ? 'max-h-[calc(95vh-80px)]' : 'max-h-[80vh]'}`}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

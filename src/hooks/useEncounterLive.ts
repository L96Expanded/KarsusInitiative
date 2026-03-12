import { useEffect, useRef } from 'react'
import { WebPubSubClient } from '@azure/web-pubsub-client'
import type { Encounter } from '@/types'

/**
 * Connects to Azure Web PubSub and calls `onUpdate` whenever the server
 * broadcasts an encounter state change to this encounter's group.
 *
 * Falls back gracefully — if negotiate fails (e.g. PubSub not configured
 * locally) the hook simply does nothing; polling is still available as backup.
 */
export function useEncounterLive(
  encounterId: string | undefined,
  onUpdate: (enc: Encounter) => void,
) {
  // Keep the latest callback in a ref so the effect never needs to re-run
  // just because the parent component re-rendered with a new function ref.
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  useEffect(() => {
    if (!encounterId) return

    let client: WebPubSubClient | null = null
    let cancelled = false

    async function connect() {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/negotiate?encounterId=${encounterId}`, {
        headers: token ? { 'X-Auth-Token': `Bearer ${token}` } : {},
      })
      if (!res.ok || cancelled) return

      const { url } = (await res.json()) as { url: string }
      if (cancelled) return

      client = new WebPubSubClient(url)

      client.on('group-message', (e) => {
        try {
          const raw = e.message.data
          const enc: Encounter = typeof raw === 'string' ? JSON.parse(raw) : (raw as Encounter)
          onUpdateRef.current(enc)
        } catch {
          // Ignore malformed messages
        }
      })

      await client.start()

      // Explicitly join the group — token-based auto-join doesn't always fire
      // when the window is already open and the WebSocket reconnects.
      if (!cancelled) {
        await client.joinGroup(`encounter-${encounterId}`)
      }
    }

    connect().catch(() => {
      // Silently ignore — the app works without real-time (via polling fallback)
    })

    return () => {
      cancelled = true
      client?.stop()
    }
  }, [encounterId])
}

import { WebPubSubServiceClient, type JSONTypes } from '@azure/web-pubsub'

const HUB = 'encounters'

let _client: WebPubSubServiceClient | null = null

function client(): WebPubSubServiceClient {
  if (!_client) {
    const conn = process.env.PUBSUB_CONNECTION_STRING
    if (!conn) throw Object.assign(new Error('PUBSUB_CONNECTION_STRING not configured'), { status: 503 })
    _client = new WebPubSubServiceClient(conn, HUB)
  }
  return _client
}

/** Called by the negotiate endpoint — returns a WebSocket URL for the given encounter group. */
export async function getClientToken(userId: string, encounterId: string) {
  return client().getClientAccessToken({
    userId,
    groups:                  [`encounter-${encounterId}`],
    roles:                   ['webpubsub.joinLeaveGroup', 'webpubsub.sendToGroup'],
    expirationTimeInMinutes: 120,
  })
}

/**
 * Broadcast the full updated encounter to every WebSocket client watching it.
 * Failures are silently swallowed so a PubSub outage never breaks a mutation.
 */
export async function broadcastEncounter(encounterId: string, data: unknown): Promise<void> {
  try {
    await client().group(`encounter-${encounterId}`).sendToAll(data as JSONTypes)
  } catch {
    // Non-fatal: polling / next request will eventually sync clients
  }
}

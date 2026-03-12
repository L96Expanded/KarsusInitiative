import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from '@azure/functions'
import { authenticate } from '../lib/auth'
import { getClientToken } from '../lib/pubsub'

// ── GET /api/negotiate?encounterId={id} ──────────────────────────────────────
// Returns a short-lived Web PubSub WebSocket URL that auto-joins the caller
// to the `encounter-{id}` group.  Requires a valid JWT (same auth as all other
// endpoints).
async function negotiate(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId }  = authenticate(req)
    const encounterId = req.query.get('encounterId')
    if (!encounterId) {
      return { status: 400, jsonBody: { message: 'encounterId query parameter is required' } }
    }

    const token = await getClientToken(userId, encounterId)
    return { status: 200, jsonBody: { url: token.url } }
  } catch (e: unknown) {
    return {
      status:   (e as { status?: number }).status ?? 500,
      jsonBody: { message: e instanceof Error ? e.message : 'Error' },
    }
  }
}

app.http('negotiate', {
  methods:   ['GET'],
  route:     'negotiate',
  authLevel: 'anonymous',
  handler:   negotiate,
})

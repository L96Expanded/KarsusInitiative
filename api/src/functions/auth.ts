import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { usersContainer } from '../lib/cosmosdb'
import { signToken, authenticate } from '../lib/auth'

// ─── Helper ───────────────────────────────────────────────────────────────────
function json(body: unknown, status = 200): HttpResponseInit {
  return { status, jsonBody: body }
}
function err(message: string, status = 400): HttpResponseInit {
  return { status, jsonBody: { message } }
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
async function register(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { email, username, password } = (await req.json()) as {
      email?: string; username?: string; password?: string
    }

    if (!email || !username || !password) return err('email, username and password are required')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('Invalid email')
    if (password.length < 6) return err('Password must be at least 6 characters')
    if (username.length < 2 || username.length > 30) return err('Username must be 2–30 characters')

    const container = await usersContainer()

    // Check email uniqueness
    const { resources } = await container.items
      .query({ query: 'SELECT c.id FROM c WHERE c.email = @email', parameters: [{ name: '@email', value: email.toLowerCase() }] })
      .fetchAll()
    if (resources.length > 0) return err('Email already registered', 409)

    const passwordHash = await bcrypt.hash(password, 12)
    const now = new Date().toISOString()
    const user = {
      id:           randomUUID(),
      email:        email.toLowerCase(),
      username:     username.trim(),
      passwordHash,
      createdAt:    now,
    }

    await container.items.create(user)

    const token = signToken({ userId: user.id, email: user.email })
    return json({ token, user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt } }, 201)
  } catch (e: unknown) {
    const status = (e as { status?: number }).status ?? 500
    const message = (e instanceof Error) ? e.message : 'Internal error'
    return err(message, status)
  }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
async function login(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string }
    if (!email || !password) return err('email and password are required')

    const container = await usersContainer()
    const { resources } = await container.items
      .query({ query: 'SELECT * FROM c WHERE c.email = @email', parameters: [{ name: '@email', value: email.toLowerCase() }] })
      .fetchAll()

    const user = resources[0]
    if (!user) return err('Invalid credentials', 401)

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return err('Invalid credentials', 401)

    const token = signToken({ userId: user.id, email: user.email })
    return json({ token, user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt } })
  } catch (e: unknown) {
    const status = (e as { status?: number }).status ?? 500
    const message = (e instanceof Error) ? e.message : 'Internal error'
    return err(message, status)
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
async function me(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticate(req)
    const container  = await usersContainer()
    const { resource } = await container.item(userId, userId).read()
    if (!resource) return err('User not found', 404)
    return json({ id: resource.id, email: resource.email, username: resource.username, createdAt: resource.createdAt })
  } catch (e: unknown) {
    const status = (e as { status?: number }).status ?? 500
    const message = (e instanceof Error) ? e.message : 'Internal error'
    return err(message, status)
  }
}

// ─── Register functions ───────────────────────────────────────────────────────
app.http('auth-register', { methods: ['POST'], route: 'auth/register', authLevel: 'anonymous', handler: register })
app.http('auth-login',    { methods: ['POST'], route: 'auth/login',    authLevel: 'anonymous', handler: login })
app.http('auth-me',       { methods: ['GET'],  route: 'auth/me',       authLevel: 'anonymous', handler: me })

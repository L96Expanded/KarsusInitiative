/**
 * Auth library unit tests.
 * Run with: npm test (from api/)
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { signToken, verifyToken, authenticate } from '../lib/auth'
import type { HttpRequest } from '@azure/functions'

// Set a valid secret so the module doesn't throw at call time
beforeEach(() => {
  process.env.JWT_SECRET = 'test-secret-that-is-long-enough-to-pass-validation-12345'
})

// ─── signToken / verifyToken ─────────────────────────────────────────────────
describe('signToken / verifyToken', () => {
  it('round-trips a payload', () => {
    const payload = { userId: 'u1', email: 'a@b.com' }
    const token   = signToken(payload)
    const decoded = verifyToken(token)

    expect(decoded.userId).toBe(payload.userId)
    expect(decoded.email).toBe(payload.email)
  })

  it('throws on a tampered token', () => {
    const token = signToken({ userId: 'u1', email: 'a@b.com' })
    expect(() => verifyToken(token + 'x')).toThrow()
  })

  it('throws when JWT_SECRET is too short', () => {
    process.env.JWT_SECRET = 'short'
    expect(() => signToken({ userId: 'u1', email: 'a@b.com' })).toThrow('JWT_SECRET must be at least 32 characters')
  })
})

// ─── authenticate ────────────────────────────────────────────────────────────
function makeRequest(headers: Record<string, string>): HttpRequest {
  return {
    headers: {
      get: (key: string) => headers[key.toLowerCase()] ?? null,
    },
  } as unknown as HttpRequest
}

describe('authenticate', () => {
  it('accepts a valid Bearer token in x-auth-token', () => {
    const token = signToken({ userId: 'u1', email: 'a@b.com' })
    const req   = makeRequest({ 'x-auth-token': `Bearer ${token}` })
    const payload = authenticate(req)
    expect(payload.userId).toBe('u1')
  })

  it('falls back to authorization header', () => {
    const token = signToken({ userId: 'u2', email: 'b@c.com' })
    const req   = makeRequest({ authorization: `Bearer ${token}` })
    const payload = authenticate(req)
    expect(payload.userId).toBe('u2')
  })

  it('throws 401 when no token present', () => {
    const req = makeRequest({})
    expect(() => authenticate(req)).toThrow('Unauthorized')
  })

  it('throws 401 when scheme is not Bearer', () => {
    const token = signToken({ userId: 'u1', email: 'a@b.com' })
    const req   = makeRequest({ 'x-auth-token': `Basic ${token}` })
    expect(() => authenticate(req)).toThrow('Unauthorized')
  })

  it('throws 401 for expired / invalid token', () => {
    const req = makeRequest({ 'x-auth-token': 'Bearer not.a.real.token' })
    expect(() => authenticate(req)).toThrow('Unauthorized')
  })
})

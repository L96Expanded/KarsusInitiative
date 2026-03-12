import jwt from 'jsonwebtoken'
import type { HttpRequest } from '@azure/functions'

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d'

function getSecret(): string {
  const s = process.env.JWT_SECRET
  if (!s || s.length < 32) throw new Error('JWT_SECRET must be at least 32 characters')
  return s
}

export interface TokenPayload {
  userId: string
  email:  string
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, getSecret()) as TokenPayload
}

/**
 * Extract and verify the Bearer token from a request.
 * Returns the decoded payload or throws if invalid / missing.
 */
export function authenticate(req: HttpRequest): TokenPayload {
  // X-Auth-Token is used in production (Azure SWA strips the Authorization header).
  // Authorization is the fallback for local development via func start.
  const header = req.headers.get('x-auth-token') ?? req.headers.get('authorization') ?? ''
  const [scheme, token] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 })
  }
  try {
    return verifyToken(token)
  } catch {
    throw Object.assign(new Error('Unauthorized'), { status: 401 })
  }
}

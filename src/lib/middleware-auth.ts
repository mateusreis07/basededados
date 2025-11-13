// Helper para validação de JWT no middleware (compatível com Edge Runtime)

export function isValidJWTFormat(token: string): boolean {
  try {
    const parts = token.split('.')
    return parts.length === 3
  } catch {
    return false
  }
}

export function decodeJWTPayload(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch {
    return null
  }
}

export function isTokenExpired(payload: any): boolean {
  try {
    if (!payload.exp) return false
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}
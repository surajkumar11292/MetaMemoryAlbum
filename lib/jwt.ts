import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const secretString = process.env.JWT_SECRET || 'metamemory-archival-jwt-secret-key-32chars-min-2026';
const secretKey = new TextEncoder().encode(secretString);

export interface MetaJWTPayload extends JWTPayload {
  sub: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export async function signJWT(payload: { sub: string; email: string; name: string; avatar_url?: string }): Promise<string> {
  return new SignJWT({
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    avatar_url: payload.avatar_url,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifyJWT(token: string): Promise<MetaJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as MetaJWTPayload;
  } catch (err) {
    return null;
  }
}

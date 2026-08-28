import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { User } from '@/lib/types';
import { SEED_USER } from '@/lib/db/seed';
import { verifyJWT } from '@/lib/jwt';

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = cookies();

  // 1. Check for signed JWT cookie
  const jwtToken = cookieStore.get('meta_jwt')?.value;
  if (jwtToken) {
    const payload = await verifyJWT(jwtToken);
    if (payload && payload.sub) {
      const user = await db.getUser(payload.sub);
      if (user) return user;

      // If user not in memory yet (e.g. fresh worker), instantiate profile record
      return await db.createUser({
        id: payload.sub,
        email: payload.email || 'archivist@metamemory.app',
        name: payload.name || (payload.email ? payload.email.split('@')[0] : 'Archivist'),
        avatar_url: payload.avatar_url || undefined,
        storage_used_bytes: 0,
      });
    }
  }

  // 2. Check for session cookie
  const sessionData = cookieStore.get('meta_session_user')?.value;
  if (!sessionData) {
    return null;
  }

  // Check if session contains serialized JSON or raw user ID
  if (sessionData.startsWith('{')) {
    try {
      const parsed = JSON.parse(sessionData);
      const user = await db.getUser(parsed.id);
      if (user) return user;

      // If not yet in DB, create profile record
      return await db.createUser({
        id: parsed.id,
        email: parsed.email || 'archivist@metamemory.app',
        name: parsed.name || 'Archivist',
        avatar_url: parsed.avatar_url || undefined,
        storage_used_bytes: 0,
      });
    } catch (e) {
      console.error('Failed to parse session cookie:', e);
    }
  }

  // Handle raw user ID
  const user = await db.getUser(sessionData);
  if (user) {
    return user;
  }

  // If demo user ID
  if (sessionData === SEED_USER.id) {
    return SEED_USER;
  }

  return null;
}

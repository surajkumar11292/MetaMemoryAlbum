import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/app';
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.user) {
        const user = data.user;
        const name = user.user_metadata?.full_name || user.user_metadata?.name || (user.email ? user.email.split('@')[0] : 'Archivist');
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || undefined;

        // Register user in database
        let dbUser = await db.getUser(user.id);
        if (!dbUser) {
          dbUser = await db.createUser({
            id: user.id,
            email: user.email || 'archivist@metamemory.app',
            name,
            avatar_url: avatarUrl,
            storage_used_bytes: 0,
          });
        }

        const cookieData = JSON.stringify({
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          avatar_url: dbUser.avatar_url,
        });

        response.cookies.set('meta_session_user', cookieData, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return response;
      }
    } catch (err) {
      console.error('OAuth code exchange error:', err);
    }
  }

  return response;
}

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/share(.*)',
  '/api/share(.*)',
  '/icon.svg',
  '/favicon.ico',
]);

export default clerkMiddleware((auth, req) => {
  // If someone directly types or navigates to old /login, redirect cleanly to homepage
  if (req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (!isPublicRoute(req)) {
    const { userId } = auth();
    if (!userId) {
      // Redirect unauthenticated users directly to the landing page with modal trigger
      return NextResponse.redirect(new URL('/?sign-in=true', req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

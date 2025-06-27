// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if user has the Supabase auth token cookie
  const token = request.cookies.get('sb-access-token');

  // Protect the /profile/edit route
  if (request.nextUrl.pathname.startsWith('/profile/edit') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Apply middleware to only specific routes
export const config = {
  matcher: ['/profile/edit'],
};

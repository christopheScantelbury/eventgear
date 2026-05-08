import { NextRequest, NextResponse } from 'next/server';

// Paths that never require auth (landing + auth pages)
const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password'];
// Paths that redirect logged-in users to /dashboard
const AUTH_ONLY_PATHS = ['/login', '/register', '/forgot-password'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isAuthOnly = AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p));

  // Zustand persiste em 'eg-auth' no localStorage — não acessível no middleware
  // Usamos o cookie que definimos manualmente no setAuth
  const token = req.cookies.get('eg_access')?.value;

  if (!isPublic && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from /login and /register only
  if (isAuthOnly && token) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)'],
};

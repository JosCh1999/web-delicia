import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/admin/inventario', '/admin/pedidos'];
const LOGIN_ROUTE = '/admin/login';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  // If trying to access a protected route without a session, redirect to login
  if (PROTECTED_ROUTES.includes(pathname) && !sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_ROUTE;
    return NextResponse.redirect(url);
  }

  // If trying to access login page with a session, redirect to admin dashboard
  if (pathname === LOGIN_ROUTE && sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }
  
  if (pathname === '/admin' && !sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_ROUTE;
    return NextResponse.redirect(url);
  }


  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
};

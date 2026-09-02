import { auth } from '@/lib/auth/server';

// Redirects unauthenticated visitors away from the dashboard before the page
// renders, so /app never flashes its shell to a signed-out user.
export default auth.middleware({ loginUrl: '/login' });

export const config = {
  matcher: ['/app/:path*'],
};

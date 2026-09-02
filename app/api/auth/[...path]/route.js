import { auth } from '@/lib/auth/server';

// Handles sign-up, sign-in, sign-out, session, and password reset.
export const { GET, POST } = auth.handler();

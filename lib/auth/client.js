'use client';

import { createAuthClient } from '@neondatabase/auth/next';

// Talks to /api/auth/*, which proxies to Neon Auth. No base URL needed.
export const authClient = createAuthClient();

'use server';

import { cookies } from 'next/headers';

const AUTH_COOKIE_NAME = 'htl_auth_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function login(username: string, password: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const validUsername = process.env.AUTH_USERNAME;
  const validPassword = process.env.AUTH_PASSWORD;

  if (!validUsername || !validPassword) {
    console.error('Auth credentials not configured');
    return { success: false, error: 'Authentication not configured' };
  }

  if (username === validUsername && password === validPassword) {
    // Create a simple session token (timestamp + random string)
    const sessionToken = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000, // maxAge is in seconds
      path: '/',
    });

    return { success: true };
  }

  return { success: false, error: 'Invalid username or password' };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME);
  return !!session?.value;
}

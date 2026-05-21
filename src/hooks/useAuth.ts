import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';

interface StoredCredentials {
  usernameHash: string;
  passwordHash: string;
}

async function hashString(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return storage.get<boolean>('session', false);
  });

  useEffect(() => {
    const session = storage.get<boolean>('session', false);
    setIsAdmin(session);
  }, []);

  async function login(user: string, pass: string): Promise<boolean> {
    const stored = storage.get<StoredCredentials | null>('credentials', null);
    if (!stored) return false;

    const usernameHash = await hashString(user);
    const passwordHash = await hashString(pass);

    if (
      usernameHash === stored.usernameHash &&
      passwordHash === stored.passwordHash
    ) {
      storage.set('session', true);
      setIsAdmin(true);
      return true;
    }

    return false;
  }

  function logout(): void {
    storage.remove('session');
    setIsAdmin(false);
  }

  return { isAdmin, login, logout };
}

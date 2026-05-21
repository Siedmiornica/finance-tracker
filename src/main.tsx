import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const CREDENTIALS_KEY = 'ft_credentials';

async function hashString(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function clearAllFtKeys(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('ft_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

async function initializeCredentials(): Promise<void> {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (raw === null) {
      const usernameHash = await hashString('admin');
      const passwordHash = await hashString('admin123');
      localStorage.setItem(
        CREDENTIALS_KEY,
        JSON.stringify({ usernameHash, passwordHash })
      );
      return;
    }
    // Validate that stored data is parseable JSON with expected shape
    const parsed = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.usernameHash !== 'string' ||
      typeof parsed.passwordHash !== 'string'
    ) {
      throw new Error('Invalid credentials format');
    }
  } catch {
    clearAllFtKeys();
    alert('Dane w localStorage były uszkodzone i zostały zresetowane.');
    const usernameHash = await hashString('admin');
    const passwordHash = await hashString('admin123');
    localStorage.setItem(
      CREDENTIALS_KEY,
      JSON.stringify({ usernameHash, passwordHash })
    );
  }
}

initializeCredentials().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});

// lib/apiAuthFetch.js — stuurt de Supabase-sessie mee naar de eigen /api-routes (incident D1, 19-10-2026).
// middleware.js eist een Bearer-token op /api; de sessie staat client-side (localStorage), dus
// fetch- en axios-aanroepen naar /api krijgen hier automatisch de Authorization-header.
// Een expliciet meegegeven Authorization-header blijft ongemoeid.
import axios from 'axios';
import supabase from '@/lib/supabase';

let geinstalleerd = false;

function isEigenApi(url) {
  try {
    const u = new URL(url, window.location.origin);
    return u.origin === window.location.origin && u.pathname.startsWith('/api/');
  } catch {
    return false;
  }
}

async function huidigToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || null;
}

export function installeerApiAuth() {
  if (geinstalleerd || typeof window === 'undefined') return;
  geinstalleerd = true;

  const origineel = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input?.url;
    if (!url || !isEigenApi(url)) return origineel(input, init);

    const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
    if (!headers.has('Authorization')) {
      const token = await huidigToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }
    if (input instanceof Request) return origineel(new Request(input, { ...init, headers }));
    return origineel(input, { ...init, headers });
  };

  axios.interceptors.request.use(async (config) => {
    if (config?.url && isEigenApi(config.url)) {
      const heeftAuth = config.headers && (config.headers.Authorization || config.headers.authorization);
      if (!heeftAuth) {
        const token = await huidigToken();
        if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
      }
    }
    return config;
  });
}

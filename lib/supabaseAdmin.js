// lib/supabaseAdmin.js — server-only Supabase client (service-role).
// Uitsluitend voor API-routes: bereikt de privileged public RPC-laag (ifc_review_*)
// die over het geïsoleerde assembly-schema werkt. NOOIT importeren in client-code.
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _admin = null;

export function supabaseAdmin() {
  if (!url || !key) throw new Error('Supabase service-role-config ontbreekt op de server.');
  if (!_admin) {
    _admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return _admin;
}

export default supabaseAdmin;

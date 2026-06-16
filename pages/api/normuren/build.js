// pages/api/normuren/build.js — Bouw approved → normuren-consensuslaag (POST).
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Alleen POST' });
  try {
    const { data, error } = await supabaseAdmin().rpc('normuren_build');
    if (error) throw error;
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

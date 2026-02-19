// scripts/supabase.js – Supabase client initialisation and auth helpers
// Must be loaded after the Supabase CDN script.

const SUPABASE_URL = 'https://ybtjdluidbegeahqnpbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidGpkbHVpZGJlZ2VhaHFucGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzUwNjQsImV4cCI6MjA4Njk1MTA2NH0.DWa5vQY5EwfIzv9cX7iQp2EujV2Q3yd-q0tz0cxGSlc';

// Create a single supabase client for the whole app
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------- Auth functions ----------
async function signIn(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signUp(email, password) {
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

async function signOut() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
}

function getCurrentUser() {
  return supabaseClient.auth.getUser();
}

function onAuthStateChange(callback) {
  return supabaseClient.auth.onAuthStateChange(callback);
}

// ---------- Data helpers (settings & progress) ----------
async function fetchSettings(userId) {
  const { data, error } = await supabaseClient
    .from('user_settings')
    .select('settings')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data?.settings || null;
}

async function saveSettings(userId, settings) {
  const { data, error } = await supabaseClient
    .from('user_settings')
    .upsert({ user_id: userId, settings, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select();
  if (error) throw error;
  return data;
}

async function fetchProgress(userId) {
  const { data, error } = await supabaseClient
    .from('user_progress')
    .select('progress')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data?.progress || null;
}

async function saveProgress(userId, progress) {
  const { data, error } = await supabaseClient
    .from('user_progress')
    .upsert({ user_id: userId, progress, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select();
  if (error) throw error;
  return data;
}

// ---------- Statistics (new) ----------
async function fetchStatistics() {
  const { data, error } = await supabaseClient
    .from('app_statistics')
    .select('*')
    .eq('id', 1)
    .single();
  if (error) throw error;
  return data;
}

// Attach everything to a global object for use by other scripts
window.DHESupabase = {
  client: supabaseClient,
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  fetchSettings,
  saveSettings,
  fetchProgress,
  saveProgress,
  fetchStatistics
};
// scripts/supabase.js – Supabase client with unified user_data functions

const SUPABASE_URL = 'https://ybtjdluidbegeahqnpbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidGpkbHVpZGJlZ2VhaHFucGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzUwNjQsImV4cCI6MjA4Njk1MTA2NH0.DWa5vQY5EwfIzv9cX7iQp2EujV2Q3yd-q0tz0cxGSlc';

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

// ---------- Unified user_data functions ----------
async function fetchUserData(userId) {
  const { data, error } = await supabaseClient
    .from('user_data')
    .select('settings, progress')
    .eq('user_id', userId)
    .single();
  // PGRST116 = no rows found → return default empty objects
  if (error && error.code !== 'PGRST116') throw error;
  return data || { settings: {}, progress: {} };
}

async function saveUserData(userId, settings, progress) {
  const { data, error } = await supabaseClient
    .from('user_data')
    .upsert({
      user_id: userId,
      settings: settings || {},
      progress: progress || {},
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select();
  if (error) throw error;
  return data;
}

// ---------- Statistics (unchanged) ----------
async function fetchStatistics() {
  const { data, error } = await supabaseClient
    .from('app_statistics')
    .select('*')
    .eq('id', 1)
    .single();
  if (error) throw error;
  return data;
}

// Attach everything to global object
window.DHESupabase = {
  client: supabaseClient,
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  fetchUserData,
  saveUserData,
  fetchStatistics
};
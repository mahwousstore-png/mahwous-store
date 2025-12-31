import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are valid (not just the variable names swapped)
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('http') && supabaseUrl.includes('supabase');
const isValidKey = supabaseAnonKey && supabaseAnonKey.length > 30 && !supabaseAnonKey.startsWith('VITE_');

export const isSupabaseConfigured = isValidUrl && isValidKey;

// Create a dummy client that returns empty data when Supabase is not configured
const createDummyClient = (): SupabaseClient => {
  const dummyResponse = { data: null, error: { message: 'Supabase not configured', code: 'CONFIG_ERROR' } };
  const dummyBuilder = {
    select: () => dummyBuilder,
    insert: () => dummyBuilder,
    update: () => dummyBuilder,
    delete: () => dummyBuilder,
    eq: () => dummyBuilder,
    neq: () => dummyBuilder,
    gt: () => dummyBuilder,
    lt: () => dummyBuilder,
    gte: () => dummyBuilder,
    lte: () => dummyBuilder,
    like: () => dummyBuilder,
    ilike: () => dummyBuilder,
    is: () => dummyBuilder,
    in: () => dummyBuilder,
    order: () => dummyBuilder,
    limit: () => dummyBuilder,
    single: () => Promise.resolve(dummyResponse),
    then: (resolve: any) => resolve(dummyResponse),
  };

  return {
    from: () => dummyBuilder,
    channel: () => ({
      on: () => ({ on: () => ({ subscribe: () => {} }) }),
      subscribe: () => {},
    }),
    removeChannel: () => {},
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signIn: () => Promise.resolve(dummyResponse),
      signOut: () => Promise.resolve({ error: null }),
    },
  } as unknown as SupabaseClient;
};

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createDummyClient();

export interface WebhookData {
  id: string;
  source: string;
  type: string;
  data: any;
  timestamp: string;
  created_at: string;
  updated_at: string;
}
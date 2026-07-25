import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://dumbsnxhmqdwbxohduat.supabase.co";

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_2NA0dzAJhHe5rbTNvt425A_mKLoJrXC";

export const supabase = createClient(supabaseUrl, supabaseKey);
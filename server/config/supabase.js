import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_KEY = process.env.SUPABASE_KEY;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
export const JWT_SECRET = process.env.JWT_SECRET || 'fss-super-secret-key-change-me';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("CRITICAL ERROR: SUPABASE_URL and SUPABASE_KEY must be set.");
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '');

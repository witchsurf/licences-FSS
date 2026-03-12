import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, '../../');

// Load env vars from .env.local and .env in the root directory
dotenv.config({ path: path.join(rootPath, '.env.local') });
dotenv.config({ path: path.join(rootPath, '.env') });

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_KEY = process.env.SUPABASE_KEY;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
export const JWT_SECRET = process.env.JWT_SECRET || 'fss-super-secret-key-change-me';
export const PORT = process.env.PORT || 3000;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("CRITICAL ERROR: SUPABASE_URL and SUPABASE_KEY must be set.");
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '');

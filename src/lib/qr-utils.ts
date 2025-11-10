/**
 * Generate a random short code for dynamic QR URLs
 * Format: 6 alphanumeric characters (e.g., aBc123)
 */
export function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if a short code is already in use
 */
import { type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export async function isShortCodeAvailable(
  supabase: SupabaseClient<Database>,
  shortCode: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('id')
    .eq('short_url', shortCode)
    .maybeSingle();

  if (error) {
    console.error('Error checking short code:', error);
    return false;
  }

  return !data; // Available if no data found
}

/**
 * Generate a unique short code that's not already in use
 */
export async function generateUniqueShortCode(supabase: SupabaseClient<Database>): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateShortCode();
    const available = await isShortCodeAvailable(supabase, code);
    
    if (available) {
      return code;
    }
    
    attempts++;
  }

  throw new Error('Failed to generate unique short code after ' + maxAttempts + ' attempts');
}

/**
 * Get the full redirect URL for a short code
 */
export function getRedirectUrl(shortCode: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const projectId = supabaseUrl.replace('https://', '').split('.')[0];
  return `https://${projectId}.supabase.co/functions/v1/qr-redirect/${shortCode}`;
}

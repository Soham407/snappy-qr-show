import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Running QR code expiry check...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date().toISOString();

    // Find all dynamic QR codes that have expired (expires_at < now) and are still active
    const { data: expiredCodes, error: fetchError } = await supabase
      .from('qr_codes')
      .select('id, name, expires_at, status')
      .eq('type', 'dynamic')
      .eq('status', 'active')
      .lt('expires_at', now);

    if (fetchError) {
      console.error('Error fetching expired codes:', fetchError);
      throw fetchError;
    }

    if (!expiredCodes || expiredCodes.length === 0) {
      console.log('No expired QR codes found');
      return new Response(
        JSON.stringify({ message: 'No expired codes', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${expiredCodes.length} expired QR codes`);

    // Update status to trial_expired (entering grace period)
    const { error: updateError } = await supabase
      .from('qr_codes')
      .update({ status: 'trial_expired' })
      .in('id', expiredCodes.map(code => code.id));

    if (updateError) {
      console.error('Error updating expired codes:', updateError);
      throw updateError;
    }

    // Check for codes in grace period that need to be deactivated (3 days after expiry)
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() - 3);
    
    const { data: gracePeriodExpired, error: graceError } = await supabase
      .from('qr_codes')
      .select('id, name')
      .eq('status', 'trial_expired')
      .lt('expires_at', gracePeriodEnd.toISOString());

    if (graceError) {
      console.error('Error fetching grace period expired codes:', graceError);
    } else if (gracePeriodExpired && gracePeriodExpired.length > 0) {
      console.log(`Found ${gracePeriodExpired.length} codes past grace period`);
      
      // Deactivate codes past grace period
      const { error: deactivateError } = await supabase
        .from('qr_codes')
        .update({ status: 'paid_expired' })
        .in('id', gracePeriodExpired.map(code => code.id));

      if (deactivateError) {
        console.error('Error deactivating codes:', deactivateError);
      }
    }

    const result = {
      message: 'Expiry check completed',
      expiredCount: expiredCodes.length,
      deactivatedCount: gracePeriodExpired?.length || 0,
      timestamp: now,
    };

    console.log('Result:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Cron job error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

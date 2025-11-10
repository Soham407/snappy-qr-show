import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shortCode, reason } = await req.json();

    if (!shortCode) {
      return new Response(
        JSON.stringify({ error: 'Short code is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Report received for short code: ${shortCode}, reason: ${reason}`);

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find QR code by short_url
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('id, status')
      .eq('short_url', shortCode)
      .single();

    if (qrError || !qrCode) {
      console.error('QR code not found:', qrError);
      return new Response(
        JSON.stringify({ error: 'QR code not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update QR code status to 'reported'
    const { error: updateError } = await supabase
      .from('qr_codes')
      .update({ 
        status: 'reported',
        updated_at: new Date().toISOString()
      })
      .eq('id', qrCode.id);

    if (updateError) {
      console.error('Failed to update QR code status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to report QR code' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`QR code ${qrCode.id} marked as reported`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'QR code reported successfully. Thank you for helping keep our platform safe.'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Report error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

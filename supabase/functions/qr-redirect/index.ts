import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};


// Edge function handler (Deno global available at runtime)
Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const shortCode = url.pathname.split('/').pop();

    if (!shortCode) {
      return new Response('Invalid QR code', { status: 400 });
    }

    console.log(`Redirect requested for short code: ${shortCode}`);

    // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find QR code by short_url
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('id, destination_url, status, type')
      .eq('short_url', shortCode)
      .single();

    if (qrError || !qrCode) {
      console.error('QR code not found:', qrError);
      return new Response('QR code not found', { status: 404 });
    }

    // Check if QR code is active
    if (qrCode.status !== 'active') {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code Expired</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(to bottom, #f8fafc, #e2e8f0);
              }
              .container {
                text-align: center;
                padding: 2rem;
                max-width: 500px;
              }
              h1 { color: #1e293b; margin-bottom: 1rem; }
              p { color: #64748b; line-height: 1.6; }
              .status { 
                display: inline-block;
                padding: 0.5rem 1rem;
                background: #fee2e2;
                color: #991b1b;
                border-radius: 0.5rem;
                margin-top: 1rem;
                font-weight: 500;
              }
              .report-link {
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid #e2e8f0;
              }
              .report-link a {
                color: #64748b;
                text-decoration: none;
                font-size: 0.875rem;
              }
              .report-link a:hover {
                color: #1e293b;
                text-decoration: underline;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⚠️ QR Code Expired</h1>
              <p>This QR code is no longer active. The owner needs to renew their subscription to reactivate it.</p>
              <span class="status">Status: ${qrCode.status}</span>
              <div class="report-link">
                <a href="#" onclick="reportQR(); return false;">🚩 Report this QR code</a>
              </div>
            </div>
            <script>
              function reportQR() {
                if (confirm('Are you sure you want to report this QR code? This will flag it for review.')) {
                  fetch('${supabaseUrl}/functions/v1/qr-report', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      shortCode: '${shortCode}',
                      reason: 'User reported'
                    })
                  })
                  .then(response => response.json())
                  .then(data => {
                    alert(data.message || 'Thank you for your report.');
                  })
                  .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to submit report. Please try again.');
                  });
                }
              }
            </script>
          </body>
        </html>
      `;
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
        status: 410,
      });
    }

    // Track analytics (async, non-blocking)
    const userAgent = req.headers.get('user-agent') || '';
    const deviceType = getDeviceType(userAgent);
    
    // Get geolocation from CF headers (Cloudflare provides this)
    const cfCountry = req.headers.get('cf-ipcountry') || 'Unknown';
    const cfCity = req.headers.get('cf-ipcity') || 'Unknown';

    // Insert analytics (fire and forget)
    void supabase
      .from('qr_analytics')
      .insert({
        qr_code_id: qrCode.id,
        country: cfCountry,
        city: cfCity,
        device_type: deviceType,
      })
      .then((res: unknown) => {
        if (typeof res === 'object' && res !== null && 'error' in res) {
          const r = res as { error?: unknown };
          if (r.error) console.error('Analytics insert error:', r.error);
        }
      });

    console.log(`Redirecting to: ${qrCode.destination_url}`);

    // Redirect to destination
    return Response.redirect(qrCode.destination_url, 302);

  } catch (error) {
    console.error('Redirect error:', error);
    return new Response('Internal server error', { status: 500 });
  }
});

function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
    return 'mobile';
  } else if (/tablet|ipad/i.test(ua)) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

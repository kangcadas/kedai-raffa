// ============================================================
// Supabase Edge Function: send-push-notification
// Trigger: Dipanggil saat event terjadi (pesanan baru, status change, dll)
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')

serve(async (req) => {
  try {
    const { title, body, tag, role, data } = await req.json()

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('role', role)

    if (error) throw error

    const results = []

    for (const sub of subscriptions) {
      try {
        const pushPayload = {
          title: title || 'KEDAI RAFFA',
          body: body || 'Ada notifikasi baru',
          tag: tag || 'default',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          requireInteraction: true,
          data: data || {},
          actions: [{ action: 'open', title: 'Buka App' }]
        }

        const { sendNotification } = await import('https://esm.sh/web-push@3.6.6')

        await sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(pushPayload),
          {
            vapidDetails: {
              subject: 'mailto:nacjistiga@gmail.com',
              publicKey: VAPID_PUBLIC_KEY,
              privateKey: VAPID_PRIVATE_KEY
            }
          }
        )

        results.push({ endpoint: sub.endpoint, status: 'sent' })
      } catch (pushError) {
        if (pushError.statusCode === 410 || pushError.statusCode === 404) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        }
        results.push({ endpoint: sub.endpoint, status: 'failed', error: pushError.message })
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

// ============================================================
// KEDAI RAFFA v1.5.0 — Edge Function: send-push-notification
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

// ── ENV VARIABLES (no SUPABASE_ prefix) ──
const SB_URL = Deno.env.get('SB_URL') || ''

let serviceRoleKey = ''
const secretKeysRaw = Deno.env.get('SECRET_KEYS')
if (secretKeysRaw) {
  try {
    const secretKeys = JSON.parse(secretKeysRaw)
    serviceRoleKey = secretKeys['default'] || secretKeys['service_role'] || ''
  } catch {
    serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') || ''
  }
} else {
  serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') || ''
}

const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')

// ── INIT SUPABASE CLIENT ──
const supabase = createClient(SB_URL, serviceRoleKey)

// ── HANDLER ──
Deno.serve(async (req) => {
  try {
    const { title, body, tag, role, data } = await req.json()

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('role', role)

    if (error) {
      throw new Error('Gagal ambil subscription: ' + error.message)
    }

    const results = []

    for (const sub of subscriptions || []) {
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

        const pushRes = await fetch(sub.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'TTL': '60',
            'Urgency': 'high'
          },
          body: JSON.stringify(pushPayload)
        })

        if (pushRes.ok) {
          results.push({ endpoint: sub.endpoint, status: 'sent' })
        } else {
          const errText = await pushRes.text()
          throw new Error('Push failed: ' + pushRes.status + ' ' + errText)
        }

      } catch (pushError) {
        const msg = pushError.message || ''
        if (msg.includes('410') || msg.includes('404') || msg.includes('Expired')) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        }
        results.push({ endpoint: sub.endpoint, status: 'failed', error: msg })
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

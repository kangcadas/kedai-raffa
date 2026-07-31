// ============================================================
// KEDAI RAFFA v1.5.0 — Edge Function: auto-cancel-pending
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

// ── INIT SUPABASE CLIENT ──
const supabase = createClient(SB_URL, serviceRoleKey)

// ── HANDLER ──
Deno.serve(async (_req) => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

    const { data: pendingOrders, error } = await supabase
      .from('transaksi')
      .select('id, kode_transaksi')
      .eq('status', 'pending')
      .lt('created_at', tenMinutesAgo)

    if (error) {
      throw new Error('Gagal ambil pending orders: ' + error.message)
    }

    const cancelled = []

    for (const order of pendingOrders || []) {
      const { error: updateError } = await supabase
        .from('transaksi')
        .update({
          status: 'batal',
          updated_at: new Date().toISOString(),
          catatan: 'Dibatalkan otomatis (melebihi 10 menit)'
        })
        .eq('id', order.id)

      if (!updateError) {
        cancelled.push(order.kode_transaksi)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      cancelled_count: cancelled.length,
      cancelled_orders: cancelled
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

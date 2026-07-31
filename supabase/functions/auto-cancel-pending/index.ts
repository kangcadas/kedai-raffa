// ============================================================
// Supabase Edge Function: auto-cancel-pending
// Cron: Setiap 5 menit
// Business Rule BR-022: Auto cancel pesanan pending > 10 menit
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    // Cari transaksi pending yang sudah > 10 menit
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

    const { data: pendingOrders, error } = await supabase
      .from('transaksi')
      .select('id, kode_transaksi')
      .eq('status', 'pending')
      .lt('created_at', tenMinutesAgo)

    if (error) throw error

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

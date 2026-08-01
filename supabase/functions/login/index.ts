import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { nama, kode_akses } = await req.json()

    if (!nama || !kode_akses) {
      return new Response(JSON.stringify({ error: 'Nama dan kode akses wajib diisi' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SB_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    )

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, nama, role, kode_akses')
      .ilike('nama', nama)
      .single()

    if (error || !user) {
      return new Response(JSON.stringify({ error: 'Nama atau kode akses tidak valid' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const valid = await bcrypt.compare(kode_akses, user.kode_akses)

    if (!valid) {
      return new Response(JSON.stringify({ error: 'Nama atau kode akses tidak valid' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { kode_akses: _, ...userSafe } = user

    return new Response(JSON.stringify({ 
      success: true, 
      user: userSafe 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

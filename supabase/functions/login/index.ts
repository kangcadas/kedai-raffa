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
    const { kode_akses, role } = await req.json()

    if (!kode_akses || !role) {
      return new Response(JSON.stringify({ error: 'Kode akses dan role wajib diisi' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SB_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    )

    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, nama, role, kode_akses')
      .eq('role', role)

    if (error || !users || !users.length) {
      return new Response(JSON.stringify({ error: 'Kode akses tidak valid' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let matchedUser = null
    for (const u of users) {
      if (await bcrypt.compare(kode_akses, u.kode_akses)) {
        matchedUser = u
        break
      }
    }

    if (!matchedUser) {
      return new Response(JSON.stringify({ error: 'Kode akses tidak valid' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { kode_akses: _, ...userSafe } = matchedUser

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

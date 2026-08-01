/* ============================================================
   KEDAI RAFFA v1.5.0 — Login Fix (pakai Edge Function login)
   ============================================================ */

async function loginKedaiRaffa(nama, kodeAkses) {
  try {
    const { data, error } = await supabase.functions.invoke('login', {
      body: { nama: nama.trim(), kode_akses: kodeAkses }
    });
    if (error) throw error;
    if (!data.success) throw new Error(data.error || 'Login gagal');
    localStorage.setItem('kedai_raffa_session', JSON.stringify(data.user));
    await supabase.rpc('set_user_context', { p_user_id: data.user.id });
    return { success: true, user: data.user };
  } catch (err) {
    return { success: false, error: err.message || 'Nama atau kode akses tidak valid' };
  }
}

function logoutKedaiRaffa() {
  localStorage.removeItem('kedai_raffa_session');
  window.location.reload();
}

function getSessionKedaiRaffa() {
  const s = localStorage.getItem('kedai_raffa_session');
  return s ? JSON.parse(s) : null;
}

async function initSession() {
  const session = getSessionKedaiRaffa();
  if (session && session.id) {
    try {
      await supabase.rpc('set_user_context', { p_user_id: session.id });
      return session;
    } catch (e) {
      logoutKedaiRaffa();
      return null;
    }
  }
  return null;
}

window.loginKedaiRaffa = loginKedaiRaffa;
window.logoutKedaiRaffa = logoutKedaiRaffa;
window.getSessionKedaiRaffa = getSessionKedaiRaffa;
window.initSession = initSession;

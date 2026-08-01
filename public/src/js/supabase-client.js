// ============================================================
// KEDAI RAFFA v1.5.0 — Supabase Client & Realtime Setup
// ============================================================

class KedaiRaffaSupabase {
  constructor(supabaseUrl, supabaseKey) {
    this.supabase = supabase.createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });

    this.channels = [];
  }

  // ── AUTH ──
  async loginWithKodeAkses(kodeAkses) {
    const { data, error } = await this.supabase
      .from('users')
      .select('id, nama, role, kode_akses, aktif')
      .eq('kode_akses', kodeAkses)
      .eq('aktif', true)
      .single();

    if (error || !data) {
      throw new Error('Kode akses tidak valid atau user tidak aktif');
    }

    localStorage.setItem('kr_user_id', data.id);
    localStorage.setItem('kr_user_name', data.nama);
    localStorage.setItem('kr_user_role', data.role);

    return data;
  }

  logout() {
    localStorage.removeItem('kr_user_id');
    localStorage.removeItem('kr_user_name');
    localStorage.removeItem('kr_user_role');
    this.unsubscribeAll();
  }

  getCurrentUser() {
    return {
      id: localStorage.getItem('kr_user_id'),
      name: localStorage.getItem('kr_user_name'),
      role: localStorage.getItem('kr_user_role')
    };
  }

  // ── REALTIME: PESANAN BARU ──
  subscribePesananBaru(callback) {
    const channel = this.supabase
      .channel('pesanan-baru')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transaksi'
      }, (payload) => {
        callback(payload.new);
      })
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  // ── REALTIME: STATUS PESANAN ──
  subscribeStatusPesanan(callback) {
    const channel = this.supabase
      .channel('status-pesanan')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'transaksi'
      }, (payload) => {
        callback(payload.new);
      })
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  // ── REALTIME: MONITORING ──
  subscribeMonitoring(callback) {
    const channel = this.supabase
      .channel('monitoring')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'monitoring'
      }, (payload) => {
        callback(payload.new);
      })
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  // ── REALTIME: PRINT QUEUE ──
  subscribePrintQueue(callback) {
    const channel = this.supabase
      .channel('print-queue')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'print_queue'
      }, (payload) => {
        callback(payload.new);
      })
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  // ── UNsubscribe ALL ──
  unsubscribeAll() {
    for (const channel of this.channels) {
      this.supabase.removeChannel(channel);
    }
    this.channels = [];
  }

  // ── QUERY HELPERS ──
  async getMenuAktif() {
    const { data, error } = await this.supabase
      .from('menu')
      .select('*')
      .eq('aktif', true)
      .order('urutan', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getStokGerai() {
    const { data, error } = await this.supabase
      .from('stok_gerai')
      .select('*, logistik:logistik_id(nama, satuan, min_stok)')
      .order('logistik_id');

    if (error) throw error;
    return data;
  }

  async createTransaksi(transaksiData) {
    const { data, error } = await this.supabase
      .from('transaksi')
      .insert(transaksiData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTransaksiHariIni() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await this.supabase
      .from('transaksi')
      .select('*')
      .gte('created_at', today)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateTransaksiStatus(id, status) {
    const { data, error } = await this.supabase
      .from('transaksi')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMonitoringHariIni() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await this.supabase
      .from('monitoring')
      .select('*')
      .eq('tanggal', today)
      .single();

    if (error) throw error;
    return data;
  }
}

window.KedaiRaffaSupabase = KedaiRaffaSupabase;

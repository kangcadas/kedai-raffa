// ============================================================
// KEDAI RAFFA v1.5.0 — Main App
// Integrasi: Supabase + Bluetooth Printer + Push Notification
// ============================================================

class KedaiRaffaApp {
  constructor() {
    this.supabase = null;
    this.printer = null;
    this.push = null;
    this.currentUser = null;
  }

  async init(config) {
    // Init Supabase
    this.supabase = new KedaiRaffaSupabase(config.supabaseUrl, config.supabaseKey);

    // Init Printer
    this.printer = new KedaiRaffaPrinter();

    // Init Push Notification
    this.push = new KedaiRaffaPush(this.supabase.supabase, config.vapidPublicKey);
    await this.push.init();

    // Cek session
    const user = this.supabase.getCurrentUser();
    if (user.id) {
      this.currentUser = user;
      this._setupRealtime();
    }

    console.log('KEDAI RAFFA v1.5.0 initialized');
  }

  // ── LOGIN ──
  async login(kodeAkses) {
    try {
      const user = await this.supabase.loginWithKodeAkses(kodeAkses);
      this.currentUser = user;

      // Subscribe push setelah login
      if (user.role === 'owner' || user.role === 'kasir') {
        await this.push.subscribe();
      }

      this._setupRealtime();
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ── LOGOUT ──
  logout() {
    this.push.unsubscribe();
    this.supabase.logout();
    this.currentUser = null;
  }

  // ── SETUP REALTIME LISTENERS ──
  _setupRealtime() {
    const role = this.currentUser?.role;

    // Owner & Kasir: dengar pesanan baru
    if (role === 'owner' || role === 'kasir') {
      this.supabase.subscribePesananBaru((pesanan) => {
        this._onPesananBaru(pesanan);
      });

      this.supabase.subscribeStatusPesanan((pesanan) => {
        this._onStatusChange(pesanan);
      });
    }

    // Kasir: auto-print dari print_queue
    if (role === 'kasir') {
      this.supabase.subscribePrintQueue((item) => {
        this._onPrintQueue(item);
      });
    }

    // Owner: monitoring update
    if (role === 'owner') {
      this.supabase.subscribeMonitoring((data) => {
        this._onMonitoringUpdate(data);
      });
    }
  }

  // ── EVENT: PESANAN BARU ──
  _onPesananBaru(pesanan) {
    console.log('Pesanan baru:', pesanan.kode_transaksi);

    // Tampilkan notifikasi lokal
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pesanan Baru!', {
        body: `${pesanan.kode_transaksi} — ${this._formatRupiah(pesanan.total)}`,
        icon: '/icons/icon-192x192.png',
        tag: pesanan.kode_transaksi
      });
    }

    // Dispatch event ke UI
    window.dispatchEvent(new CustomEvent('app:pesanan-baru', { detail: pesanan }));
  }

  // ── EVENT: STATUS CHANGE ──
  _onStatusChange(pesanan) {
    console.log('Status update:', pesanan.kode_transaksi, '→', pesanan.status);
    window.dispatchEvent(new CustomEvent('app:status-change', { detail: pesanan }));
  }

  // ── EVENT: PRINT QUEUE ──
  async _onPrintQueue(item) {
    console.log('Print queue item:', item);

    if (!this.printer.isConnected) {
      console.warn('Printer tidak terhubung. Print queue menunggu.');
      return;
    }

    try {
      if (item.tipe === 'nota_kasir') {
        await this.printer.printNotaKasir(item.data);
      } else if (item.tipe === 'nota_dapur') {
        await this.printer.printNotaDapur(item.data);
      }

      // Update status print_queue jadi 'printed'
      await this.supabase.supabase
        .from('print_queue')
        .update({ status: 'printed', printed_at: new Date().toISOString() })
        .eq('id', item.id);

    } catch (error) {
      console.error('Gagal print:', error);
      // Update status jadi 'failed'
      await this.supabase.supabase
        .from('print_queue')
        .update({ status: 'failed', error_message: error.message })
        .eq('id', item.id);
    }
  }

  // ── EVENT: MONITORING UPDATE ──
  _onMonitoringUpdate(data) {
    window.dispatchEvent(new CustomEvent('app:monitoring-update', { detail: data }));
  }

  // ── BUAT TRANSAKSI + AUTO PRINT ──
  async buatTransaksi(data) {
    try {
      // Insert transaksi
      const transaksi = await this.supabase.createTransaksi({
        ...data,
        kasir_id: this.currentUser.id,
        created_at: new Date().toISOString()
      });

      // Auto print nota kasir jika printer tersedia
      if (this.printer.isConnected) {
        await this.printer.printNotaKasir({
          kode_transaksi: transaksi.kode_transaksi,
          tanggal: new Date().toLocaleString('id-ID'),
          kasir: this.currentUser.name,
          items: data.items,
          subtotal: data.subtotal,
          diskon: data.diskon || 0,
          pajak: data.pajak || 0,
          grand_total: data.grand_total,
          metode: data.metode,
          bayar: data.bayar,
          kembalian: data.kembalian,
          catatan: data.catatan
        });
      }

      return { success: true, transaksi };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ── FORMAT RUPIAH ──
  _formatRupiah(num) {
    return 'Rp ' + (num || 0).toLocaleString('id-ID');
  }
}

window.KedaiRaffaApp = KedaiRaffaApp;

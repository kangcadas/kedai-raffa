// ============================================================
// KEDAI RAFFA v1.5.0 — Bluetooth Printer Module
// ESC/POS Thermal Printer via Web Bluetooth API
// ============================================================
// Prioritas: Android Chrome/Edge (Web Bluetooth support)
// Profile: Generic ESC/POS Bluetooth Printer (58mm/80mm)
// ============================================================

class KedaiRaffaPrinter {
  constructor() {
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristic = null;
    this.isConnected = false;
    this.printerName = localStorage.getItem('kr_printer_name') || '';
    this.printerId = localStorage.getItem('kr_printer_id') || '';

    // ESC/POS Command Constants
    this.ESC = 0x1B;
    this.GS = 0x1D;
    this.LF = 0x0A;
    this.INIT = [this.ESC, 0x40]; // Initialize printer
    this.CENTER = [this.ESC, 0x61, 0x01]; // Align center
    this.LEFT = [this.ESC, 0x61, 0x00]; // Align left
    this.RIGHT = [this.ESC, 0x61, 0x02]; // Align right
    this.BOLD_ON = [this.ESC, 0x45, 0x01];
    this.BOLD_OFF = [this.ESC, 0x45, 0x00];
    this.DOUBLE_ON = [this.ESC, 0x21, 0x30];
    this.DOUBLE_OFF = [this.ESC, 0x21, 0x00];
    this.CUT = [this.GS, 0x56, 0x00]; // Full cut
    this.PARTIAL_CUT = [this.GS, 0x56, 0x01];
    this.FEED = [this.ESC, 0x64, 0x03]; // Feed 3 lines

    // UUIDs untuk printer ESC/POS Bluetooth
    this.PRINTER_SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb';
    this.PRINTER_WRITE_UUID = '00002af1-0000-1000-8000-00805f9b34fb';
  }

  // ── CEK SUPPORT ──
  isSupported() {
    return 'bluetooth' in navigator;
  }

  // ── SCAN & PAIR PRINTER ──
  async scanAndPair() {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth tidak didukung di browser ini. Gunakan Chrome Android.');
    }

    try {
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: false,
        filters: [
          { services: [this.PRINTER_SERVICE_UUID] },
          { namePrefix: 'Printer' },
          { namePrefix: 'POS' },
          { namePrefix: 'Thermal' },
          { namePrefix: 'Blue' }
        ],
        optionalServices: [this.PRINTER_SERVICE_UUID]
      });

      // Simpan info printer
      this.printerName = this.device.name;
      this.printerId = this.device.id;
      localStorage.setItem('kr_printer_name', this.printerName);
      localStorage.setItem('kr_printer_id', this.printerId);

      // Listen disconnect
      this.device.addEventListener('gattserverdisconnected', () => {
        this.isConnected = false;
        console.log('Printer terputus');
        this._emitEvent('disconnected');
      });

      await this.connect();
      return { success: true, name: this.printerName, id: this.printerId };

    } catch (error) {
      console.error('Gagal pair printer:', error);
      throw error;
    }
  }

  // ── CONNECT KE PRINTER YANG SUDAH DI-PAIR ──
  async connect() {
    if (!this.device && this.printerId) {
      // Coba reconnect ke device yang sudah pernah dipair
      const devices = await navigator.bluetooth.getDevices();
      this.device = devices.find(d => d.id === this.printerId);
    }

    if (!this.device) {
      throw new Error('Belum ada printer yang dipair. Pilih "Pair Printer" terlebih dahulu.');
    }

    try {
      this.server = await this.device.gatt.connect();
      this.service = await this.server.getPrimaryService(this.PRINTER_SERVICE_UUID);
      this.characteristic = await this.service.getCharacteristic(this.PRINTER_WRITE_UUID);
      this.isConnected = true;
      this._emitEvent('connected', { name: this.printerName });
      return true;
    } catch (error) {
      this.isConnected = false;
      throw new Error('Gagal connect ke printer: ' + error.message);
    }
  }

  // ── DISCONNECT ──
  async disconnect() {
    if (this.device && this.device.gatt.connected) {
      await this.device.gatt.disconnect();
    }
    this.isConnected = false;
    this._emitEvent('disconnected');
  }

  // ── FORGET PRINTER ──
  async forget() {
    await this.disconnect();
    this.device = null;
    this.printerName = '';
    this.printerId = '';
    localStorage.removeItem('kr_printer_name');
    localStorage.removeItem('kr_printer_id');
    this._emitEvent('forgotten');
  }

  // ── GET STATUS ──
  getStatus() {
    return {
      isSupported: this.isSupported(),
      isConnected: this.isConnected,
      printerName: this.printerName,
      printerId: this.printerId
    };
  }

  // ── SEND RAW BYTES ──
  async send(bytes) {
    if (!this.isConnected || !this.characteristic) {
      await this.connect();
    }

    // ESC/POS chunk size max ~512 bytes untuk BLE
    const CHUNK_SIZE = 512;
    for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
      const chunk = bytes.slice(i, i + CHUNK_SIZE);
      await this.characteristic.writeValue(new Uint8Array(chunk));
    }
  }

  // ============================================================
  // NOTA PRINTERS
  // ============================================================

  // ── PRINT NOTA KASIR (Struk Pembayaran) ──
  async printNotaKasir(data) {
    const {
      kode_transaksi,
      tanggal,
      kasir,
      items = [],
      subtotal = 0,
      diskon = 0,
      pajak = 0,
      grand_total = 0,
      metode = 'TUNAI',
      bayar = 0,
      kembalian = 0,
      catatan = ''
    } = data;

    let cmd = [];

    // Init
    cmd.push(...this.INIT);

    // Header
    cmd.push(...this.CENTER);
    cmd.push(...this.DOUBLE_ON);
    cmd.push(...this._text('KEDAI RAFFA'));
    cmd.push(...this.DOUBLE_OFF);
    cmd.push(...this._text('Jl. Contoh No. 123'));
    cmd.push(...this._text('Telp: 0812-3456-7890'));
    cmd.push(...this._line('='));
    cmd.push(...this.LEFT);

    // Info Transaksi
    cmd.push(...this._text(`No   : ${kode_transaksi}`));
    cmd.push(...this._text(`Tgl  : ${tanggal}`));
    cmd.push(...this._text(`Kasir: ${kasir}`));
    cmd.push(...this._line('-'));

    // Items
    for (const item of items) {
      const nama = item.nama.substring(0, 20).padEnd(20, ' ');
      const qty = String(item.qty).padStart(3, ' ');
      const harga = this._formatRupiah(item.harga).padStart(10, ' ');
      cmd.push(...this._text(`${nama}${qty}${harga}`));
      if (item.catatan) {
        cmd.push(...this._text(`  > ${item.catatan}`));
      }
    }

    cmd.push(...this._line('-'));

    // Summary
    cmd.push(...this._text(`Subtotal : ${this._formatRupiah(subtotal).padStart(24, ' ')}`));
    if (diskon > 0) {
      cmd.push(...this._text(`Diskon   : ${this._formatRupiah(diskon).padStart(24, ' ')}`));
    }
    if (pajak > 0) {
      cmd.push(...this._text(`Pajak    : ${this._formatRupiah(pajak).padStart(24, ' ')}`));
    }
    cmd.push(...this._text(`TOTAL    : ${this._formatRupiah(grand_total).padStart(24, ' ')}`));
    cmd.push(...this._line('-'));
    cmd.push(...this._text(`Metode   : ${metode}`));
    cmd.push(...this._text(`Bayar    : ${this._formatRupiah(bayar).padStart(24, ' ')}`));
    cmd.push(...this._text(`Kembali  : ${this._formatRupiah(kembalian).padStart(24, ' ')}`));

    if (catatan) {
      cmd.push(...this._line('-'));
      cmd.push(...this._text(`Catatan: ${catatan}`));
    }

    // Footer
    cmd.push(...this._line('='));
    cmd.push(...this.CENTER);
    cmd.push(...this._text('Terima Kasih'));
    cmd.push(...this._text('Selamat Menikmati'));
    cmd.push(...this.FEED);
    cmd.push(...this.FEED);
    cmd.push(...this.CUT);

    await this.send(cmd);
    this._emitEvent('print_success', { type: 'nota_kasir', kode: kode_transaksi });
  }

  // ── PRINT NOTA DAPUR (Kitchen Order) ──
  async printNotaDapur(data) {
    const {
      kode_transaksi,
      tanggal,
      kasir,
      items = [],
      meja = '-',
      nama_pelanggan = '-',
      catatan = ''
    } = data;

    let cmd = [];
    cmd.push(...this.INIT);
    cmd.push(...this.CENTER);
    cmd.push(...this.DOUBLE_ON);
    cmd.push(...this._text('NOTA DAPUR'));
    cmd.push(...this.DOUBLE_OFF);
    cmd.push(...this._line('='));
    cmd.push(...this.LEFT);

    cmd.push(...this._text(`No   : ${kode_transaksi}`));
    cmd.push(...this._text(`Tgl  : ${tanggal}`));
    cmd.push(...this._text(`Kasir: ${kasir}`));
    cmd.push(...this._text(`Meja : ${meja}`));
    cmd.push(...this._text(`Nama : ${nama_pelanggan}`));
    cmd.push(...this._line('-'));

    // Items bold
    cmd.push(...this.BOLD_ON);
    for (const item of items) {
      cmd.push(...this._text(`${item.qty}x ${item.nama}`));
      if (item.catatan) {
        cmd.push(...this._text(`  >> ${item.catatan}`));
      }
    }
    cmd.push(...this.BOLD_OFF);

    if (catatan) {
      cmd.push(...this._line('-'));
      cmd.push(...this._text(`CATATAN: ${catatan}`));
    }

    cmd.push(...this._line('='));
    cmd.push(...this.FEED);
    cmd.push(...this.FEED);
    cmd.push(...this.CUT);

    await this.send(cmd);
    this._emitEvent('print_success', { type: 'nota_dapur', kode: kode_transaksi });
  }

  // ── PRINT TEST PAGE ──
  async printTest() {
    let cmd = [];
    cmd.push(...this.INIT);
    cmd.push(...this.CENTER);
    cmd.push(...this.DOUBLE_ON);
    cmd.push(...this._text('KEDAI RAFFA'));
    cmd.push(...this.DOUBLE_OFF);
    cmd.push(...this._text('Test Printer Bluetooth'));
    cmd.push(...this._text(new Date().toLocaleString('id-ID')));
    cmd.push(...this._line('-'));
    cmd.push(...this.LEFT);
    cmd.push(...this._text('Printer: ' + (this.printerName || 'Unknown')));
    cmd.push(...this._text('Status : TERHUBUNG'));
    cmd.push(...this._text('Profile: ESC/POS Thermal'));
    cmd.push(...this._line('='));
    cmd.push(...this.CENTER);
    cmd.push(...this._text('Test Berhasil!'));
    cmd.push(...this.FEED);
    cmd.push(...this.FEED);
    cmd.push(...this.CUT);

    await this.send(cmd);
  }

  // ============================================================
  // HELPERS
  // ============================================================

  _text(str) {
    const encoder = new TextEncoder();
    return Array.from(encoder.encode(str + '\n'));
  }

  _line(char = '-') {
    const line = char.repeat(32);
    return this._text(line);
  }

  _formatRupiah(num) {
    return 'Rp ' + num.toLocaleString('id-ID');
  }

  _emitEvent(type, detail = {}) {
    window.dispatchEvent(new CustomEvent('printer:' + type, { detail }));
  }
}

// Export global
window.KedaiRaffaPrinter = KedaiRaffaPrinter;

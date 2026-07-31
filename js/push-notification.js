// ============================================================
// KEDAI RAFFA v1.5.0 — Push Notification Module
// Web Push API untuk Android (Owner & Kasir)
// ============================================================

class KedaiRaffaPush {
  constructor(supabaseClient, vapidPublicKey) {
    this.supabase = supabaseClient;
    this.vapidPublicKey = vapidPublicKey;
    this.swRegistration = null;
    this.isSubscribed = false;
  }

  // ── INIT ──
  async init() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notification tidak didukung di browser ini');
      return false;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', this.swRegistration.scope);

      // Cek subscription existing
      const existingSub = await this.swRegistration.pushManager.getSubscription();
      this.isSubscribed = !!existingSub;

      if (existingSub) {
        await this._saveSubscription(existingSub);
      }

      return true;
    } catch (error) {
      console.error('Gagal register SW:', error);
      return false;
    }
  }

  // ── SUBSCRIBE ──
  async subscribe() {
    if (!this.swRegistration) {
      await this.init();
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Izin notifikasi ditolak oleh user');
      }

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this._urlBase64ToUint8Array(this.vapidPublicKey)
      });

      await this._saveSubscription(subscription);
      this.isSubscribed = true;

      console.log('Push subscription berhasil');
      return { success: true, subscription };

    } catch (error) {
      console.error('Gagal subscribe push:', error);
      return { success: false, error: error.message };
    }
  }

  // ── UNSUBSCRIBE ──
  async unsubscribe() {
    if (!this.swRegistration) return;

    const subscription = await this.swRegistration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();

      // Hapus dari database
      const { error } = await this.supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint);

      if (error) console.error('Gagal hapus subscription:', error);
    }

    this.isSubscribed = false;
  }

  // ── SAVE SUBSCRIPTION KE SUPABASE ──
  async _saveSubscription(subscription) {
    const userId = localStorage.getItem('kr_user_id');
    const userRole = localStorage.getItem('kr_user_role');

    const { error } = await this.supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: subscription.endpoint,
        p256dh: subscription.toJSON().keys.p256dh,
        auth: subscription.toJSON().keys.auth,
        user_id: userId,
        role: userRole,
        device_info: navigator.userAgent,
        created_at: new Date().toISOString()
      }, { onConflict: 'endpoint' });

    if (error) {
      console.error('Gagal simpan subscription:', error);
    }
  }

  // ── KONVERSI VAPID KEY ──
  _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  }

  // ── STATUS ──
  getStatus() {
    return {
      isSupported: 'serviceWorker' in navigator && 'PushManager' in window,
      isSubscribed: this.isSubscribed,
      permission: Notification.permission
    };
  }
}

window.KedaiRaffaPush = KedaiRaffaPush;

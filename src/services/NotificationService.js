class NotificationService {
  constructor() {
    this.supported = typeof window !== "undefined" && "Notification" in window;
  }

  async requestPermission() {
    if (!this.supported) {
      console.warn("Desktop notifications not supported");
      return false;
    }

    if (Notification.permission === "granted") return true;

    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (e) {
      console.error("Error requesting notification permission:", e);
      return false;
    }
  }

  send(title, options = {}) {
    if (!this.supported) {
      this.internalFallback(title, options.body);
      return;
    }

    if (Notification.permission !== "granted") {
      console.warn("Notification permission NOT granted. Using internal fallback.");
      this.internalFallback(title, options.body);
      return;
    }

    const defaultOptions = {
      body: "",
      icon: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png",
      vibrate: [200, 100, 200],
      requireInteraction: true, // Keep it visible until dismissed
      ...options
    };

    try {
      const n = new Notification(title, defaultOptions);
      n.onclick = () => {
        window.focus();
        n.close();
      };
      return n;
    } catch (e) {
      console.error("Desktop notification failed, using internal fallback:", e);
      this.internalFallback(title, options.body);
    }
  }

  internalFallback(title, body) {
    // This will show a standard alert as a last resort, but we could also use a custom toast UI
    console.log(`[FALLBACK ALERT] ${title}: ${body}`);
    // Create a temporary UI toast if the user is active
    const toast = document.createElement('div');
    toast.className = 'premium-card animate-fade';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      background: var(--primary);
      color: white;
      min-width: 300px;
      padding: 20px;
      box-shadow: var(--shadow-xl);
      border-left: 4px solid var(--accent);
    `;
    toast.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 4px;">${title}</div>
      <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">${body || ''}</div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 8000);
  }

  test() {
    this.send("Verification: Alert System", {
      body: "If you don't see a Windows popup, check the bottom-right of your screen for the app toast.",
      tag: "test-sync"
    });
  }
}

export const notificationService = new NotificationService();

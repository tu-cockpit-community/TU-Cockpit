import { invoke } from "@tauri-apps/api/core";

export interface AutofillPayload {
  username: string;
  password: string;
  totp_code?: string | null;
  auto_fill: boolean;
}

export class AutofillDaemon {
  /**
   * Fetches active credentials and a freshly computed 6-digit TOTP token from the OS vault.
   */
  public static async getAutofillPayload(): Promise<AutofillPayload | null> {
    try {
      const payload = await invoke<AutofillPayload>("get_autofill_payload");
      if (payload && payload.auto_fill && (payload.username || payload.password)) {
        return payload;
      }
    } catch {
      // Browser preview / fallback
      const preview = localStorage.getItem("tu_vault_preview");
      if (preview) {
        try {
          const parsed = JSON.parse(preview);
          if (parsed.auto_fill && parsed.username) {
            let totpCode: string | null = null;
            if (parsed.totp_secret && parsed.totp_secret !== "******") {
              try {
                totpCode = await invoke<string>("generate_totp_code", {
                  secretBase32: parsed.totp_secret,
                });
              } catch {
                // Ignore
              }
            }
            return {
              username: parsed.username,
              password: parsed.password || "",
              totp_code: totpCode,
              auto_fill: true,
            };
          }
        } catch (e) {
          console.warn("Failed to parse local vault preview:", e);
        }
      }
    }
    return null;
  }

  /**
   * Generates a self-contained client-side JavaScript snippet to inject into webviews or iframes
   * that detects TU Wien Shibboleth, Moodle, and TISS login forms and autofills credentials and MFA codes.
   */
  public static generateAutofillScript(payload: AutofillPayload): string {
    const escapedUser = JSON.stringify(payload.username);
    const escapedPass = JSON.stringify(payload.password);
    const escapedTotp = JSON.stringify(payload.totp_code || "");

    return `
(function() {
  if (window.__tu_cockpit_autofilled__) return;

  var USERNAME = ${escapedUser};
  var PASSWORD = ${escapedPass};
  var TOTP_CODE = ${escapedTotp};

  function showAutofillBadge(detail) {
    if (document.getElementById('tu-cockpit-autofill-badge')) return;
    var badge = document.createElement('div');
    badge.id = 'tu-cockpit-autofill-badge';
    badge.style.position = 'fixed';
    badge.style.top = '12px';
    badge.style.right = '12px';
    badge.style.zIndex = '999999';
    badge.style.background = '#0f172a';
    badge.style.color = '#38bdf8';
    badge.style.border = '1px solid #0284c7';
    badge.style.borderRadius = '20px';
    badge.style.padding = '6px 14px';
    badge.style.fontSize = '12px';
    badge.style.fontWeight = '600';
    badge.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    badge.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)';
    badge.style.display = 'flex';
    badge.style.alignItems = 'center';
    badge.style.gap = '8px';
    badge.style.cursor = 'default';
    badge.style.opacity = '0';
    badge.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    badge.style.transform = 'translateY(-10px)';

    badge.innerHTML = '<span style="font-size: 14px;">🔐</span>' +
      '<span>Autofilled by TU Cockpit</span>' +
      (detail ? '<span style="color: #94a3b8; font-weight: normal; font-size: 11px;">(' + detail + ')</span>' : '') +
      '<span style="margin-left: 6px; cursor: pointer; color: #64748b;" onclick="this.parentNode.remove()">✕</span>';

    document.body.appendChild(badge);
    setTimeout(function() {
      badge.style.opacity = '1';
      badge.style.transform = 'translateY(0)';
    }, 50);

    setTimeout(function() {
      if (badge && badge.parentNode) {
        badge.style.opacity = '0';
        badge.style.transform = 'translateY(-10px)';
        setTimeout(function() { if (badge.parentNode) badge.parentNode.removeChild(badge); }, 300);
      }
    }, 6000);
  }

  function setFieldValue(el, val) {
    if (!el || !val) return false;
    el.focus();
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function tryAutofill() {
    var filledSomething = false;
    var filledDetails = [];

    // 1. Username field detection
    var userSelectors = [
      'input[name="j_username"]',
      'input[name="username"]',
      'input#username',
      'input#id_username',
      'input[name="login"]',
      'input[type="email"]',
      'input[autocomplete="username"]'
    ];
    for (var i = 0; i < userSelectors.length; i++) {
      var uInput = document.querySelector(userSelectors[i]);
      if (uInput && !uInput.value && USERNAME) {
        setFieldValue(uInput, USERNAME);
        filledSomething = true;
        filledDetails.push('Username');
        break;
      }
    }

    // 2. Password field detection
    var passSelectors = [
      'input[name="j_password"]',
      'input[name="password"]',
      'input#password',
      'input#id_password',
      'input[type="password"]',
      'input[autocomplete="current-password"]'
    ];
    for (var j = 0; j < passSelectors.length; j++) {
      var pInput = document.querySelector(passSelectors[j]);
      if (pInput && !pInput.value && PASSWORD) {
        setFieldValue(pInput, PASSWORD);
        filledSomething = true;
        filledDetails.push('Password');
        break;
      }
    }

    // 3. MFA / TOTP Authenticator field detection
    var mfaSelectors = [
      'input[name="token"]',
      'input[name="totp"]',
      'input[name="otp"]',
      'input#token',
      'input#totp',
      'input[autocomplete="one-time-code"]',
      'input[placeholder*="Code" i]',
      'input[placeholder*="6-digit" i]'
    ];
    for (var k = 0; k < mfaSelectors.length; k++) {
      var mfaInput = document.querySelector(mfaSelectors[k]);
      if (mfaInput && !mfaInput.value && TOTP_CODE) {
        setFieldValue(mfaInput, TOTP_CODE);
        filledSomething = true;
        filledDetails.push('MFA Token');
        break;
      }
    }

    if (filledSomething) {
      window.__tu_cockpit_autofilled__ = true;
      showAutofillBadge(filledDetails.join(', '));
    }
  }

  // Run immediately and observe for dynamic / multi-step login flows
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryAutofill);
  } else {
    tryAutofill();
  }

  // Periodic check for 10 seconds for AJAX / SSO redirects
  var attempts = 0;
  var interval = setInterval(function() {
    attempts++;
    tryAutofill();
    if (attempts > 20 || window.__tu_cockpit_autofilled__) {
      clearInterval(interval);
    }
  }, 500);
})();
    `;
  }

  /**
   * Attempts to execute autofill logic directly on an accessible DOM document.
   */
  public static injectIntoDocument(doc: Document, payload: AutofillPayload): boolean {
    if (!payload.auto_fill) return false;

    let filled = false;

    // Username
    const userSelectors = [
      'input[name="j_username"]',
      'input[name="username"]',
      'input#username',
      'input#id_username',
      'input[type="email"]',
    ];
    for (const sel of userSelectors) {
      const el = doc.querySelector<HTMLInputElement>(sel);
      if (el && !el.value && payload.username) {
        el.focus();
        el.value = payload.username;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        filled = true;
        break;
      }
    }

    // Password
    const passSelectors = [
      'input[name="j_password"]',
      'input[name="password"]',
      'input#password',
      'input#id_password',
      'input[type="password"]',
    ];
    for (const sel of passSelectors) {
      const el = doc.querySelector<HTMLInputElement>(sel);
      if (el && !el.value && payload.password) {
        el.focus();
        el.value = payload.password;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        filled = true;
        break;
      }
    }

    // TOTP MFA
    if (payload.totp_code) {
      const mfaSelectors = [
        'input[name="token"]',
        'input[name="totp"]',
        'input[name="otp"]',
        'input#token',
        'input[autocomplete="one-time-code"]',
      ];
      for (const sel of mfaSelectors) {
        const el = doc.querySelector<HTMLInputElement>(sel);
        if (el && !el.value) {
          el.focus();
          el.value = payload.totp_code;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
          filled = true;
          break;
        }
      }
    }

    return filled;
  }
}

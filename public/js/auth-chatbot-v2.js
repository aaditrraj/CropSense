/**
 * Auth & Chatbot UI Enhancements v2
 * Adds: password toggle, strength meter, tab indicator, Google button handler, typing indicator
 */
(function () {
  const $ = (sel) => document.querySelector(sel);

  document.addEventListener('DOMContentLoaded', () => {
    initPasswordToggles();
    initPasswordStrength();
    initTabIndicator();
    initGoogleButtonHandlers();
    patchAssistantTyping();
  });

  // ─── Password Show/Hide Toggle ──────────────────
  function initPasswordToggles() {
    document.querySelectorAll('.auth-pw-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        if (!input) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        const icon = btn.querySelector('i[data-lucide]');
        if (icon) {
          icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
          if (window.lucide?.createIcons) window.lucide.createIcons();
        }
      });
    });
  }

  // ─── Password Strength Meter ────────────────────
  function initPasswordStrength() {
    const pwInput = $('#signup-password');
    const fill = $('#signup-pw-fill');
    const label = $('#signup-pw-label');
    if (!pwInput || !fill || !label) return;

    pwInput.addEventListener('input', () => {
      const val = pwInput.value;
      let score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 10) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      const levels = [
        { width: '0%', color: 'transparent', text: '' },
        { width: '20%', color: '#ef4444', text: 'Weak' },
        { width: '40%', color: '#f59e0b', text: 'Fair' },
        { width: '60%', color: '#eab308', text: 'Good' },
        { width: '80%', color: '#22c55e', text: 'Strong' },
        { width: '100%', color: '#10b981', text: 'Excellent' }
      ];
      const level = levels[Math.min(score, 5)];
      fill.style.width = level.width;
      fill.style.background = level.color;
      label.textContent = level.text;
      label.style.color = level.color;
    });
  }

  // ─── Sliding Tab Indicator ──────────────────────
  function initTabIndicator() {
    const tabs = $('.auth-mode-tabs');
    if (!tabs) return;

    // Patch the existing switchAuthMode to update indicator
    const origSwitch = window.switchAuthMode;
    if (typeof origSwitch !== 'function') {
      // If switchAuthMode is not global, observe tab clicks directly
      const loginTab = $('#auth-tab-login');
      const signupTab = $('#auth-tab-signup');
      if (loginTab) loginTab.addEventListener('click', () => tabs.setAttribute('data-active', 'login'));
      if (signupTab) signupTab.addEventListener('click', () => tabs.setAttribute('data-active', 'signup'));

      // Also observe switch links
      const switchToSignup = $('#switch-to-signup');
      const switchToLogin = $('#switch-to-login');
      if (switchToSignup) switchToSignup.addEventListener('click', () => tabs.setAttribute('data-active', 'signup'));
      if (switchToLogin) switchToLogin.addEventListener('click', () => tabs.setAttribute('data-active', 'login'));
    }

    // Set initial state
    tabs.setAttribute('data-active', 'login');
  }

  // ─── Google Button Click Handlers ───────────────
  function initGoogleButtonHandlers() {
    ['#google-login-btn', '#google-signup-btn'].forEach(sel => {
      const btn = $(sel);
      if (!btn || btn.tagName !== 'BUTTON') return;
      btn.addEventListener('click', () => {
        // If Google Identity Services is loaded and initialized, prompt
        if (typeof google !== 'undefined' && google.accounts?.id) {
          google.accounts.id.prompt();
        } else {
          // Show a toast or warning
          if (typeof showToast === 'function') {
            showToast('Google Sign-In is not configured. Add GOOGLE_CLIENT_ID to .env.', 'warning');
          }
        }
      });
    });
  }

  // ─── Chatbot Typing Indicator ───────────────────
  function patchAssistantTyping() {
    const messagesContainer = $('#assistant-messages');
    if (!messagesContainer) return;

    // Patch addAssistantMessage to add typing indicator for assistant messages
    const origAdd = window.addAssistantMessage;
    if (typeof origAdd !== 'function') return;

    window.addAssistantMessage = function (role, text) {
      if (role === 'assistant') {
        // Show typing indicator first
        const typing = document.createElement('div');
        typing.className = 'assistant-typing';
        typing.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
        messagesContainer.appendChild(typing);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        setTimeout(() => {
          typing.remove();
          origAdd.call(window, role, text);
        }, 400 + Math.random() * 300);
      } else {
        origAdd.call(window, role, text);
      }
    };
  }
})();

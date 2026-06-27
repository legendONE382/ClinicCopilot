// ClinicCopilot — premium landing + interactive AI assistant demo
// Vanilla JS only.

const CONFIG = window.CLINIC_CONFIG || {};
const SYSTEM_PROMPT = window.SYSTEM_PROMPT || '';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// -------------------- Theme (Dark/Light) --------------------
function initTheme() {
  const root = document.documentElement;
  const stored = localStorage.getItem('cliniccopilot-theme');
  const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored ? stored : (systemDark ? 'dark' : 'light');

  if (theme === 'light') root.setAttribute('data-theme', 'light');
  else root.removeAttribute('data-theme');

  const btn = $('#themeToggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    if (isLight) root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', 'light');
    localStorage.setItem('cliniccopilot-theme', isLight ? 'dark' : 'light');
  });
}

// -------------------- Smooth scrolling offset --------------------
function initSmoothAnchors() {
  const links = $$('a[href^="#"]');
  const reduce = prefersReducedMotion();
  for (const a of links) {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const id = href.replace('#', '');
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const header = document.querySelector('.topbar');
      const headerH = header ? header.getBoundingClientRect().height : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 10;
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    });
  }
}

// -------------------- Reveal animations --------------------
function initReveal() {
  const reduce = prefersReducedMotion();
  const els = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduce) {
    for (const el of els) el.classList.add('is-revealed');
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const ent of entries) {
      if (ent.isIntersecting) {
        ent.target.classList.add('is-revealed');
        io.unobserve(ent.target);
      }
    }
  }, { threshold: 0.14 });

  for (const el of els) io.observe(el);
}

// -------------------- Mobile menu --------------------
function initMobileMenu() {
  const menuBtn = $('.menu-btn');
  const mobileMenu = $('#mobileMenu');
  if (!menuBtn || !mobileMenu) return;

  const setOpen = (open) => {
    if (open) mobileMenu.removeAttribute('hidden');
    else mobileMenu.setAttribute('hidden', '');
    menuBtn.setAttribute('aria-expanded', String(open));
  };

  setOpen(false);

  menuBtn.addEventListener('click', () => {
    const open = mobileMenu.hasAttribute('hidden') === false;
    setOpen(!open);
  });

  $$('#mobileMenu a[href^="#"]').forEach((a) => {
    a.addEventListener('click', () => setOpen(false));
  });
}

// -------------------- Ripple effect (button ripple) --------------------
function initRipples() {
  const reduce = prefersReducedMotion();
  if (reduce) return;

  document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('.btn');
    if (!btn) return;

    const ripple = btn.querySelector('.btn-ripple');
    if (!ripple) return;

    ripple.style.animation = 'none';
    ripple.getBoundingClientRect();
    ripple.style.animation = '';

    btn.classList.remove('ripple-armed');
    void btn.offsetWidth;
    btn.classList.add('ripple-armed');
  });
}

// -------------------- Animated counters --------------------
function initCounters() {
  const els = $$('[data-counter]');
  if (!els.length) return;

  const reduce = prefersReducedMotion();
  if (reduce) {
    for (const el of els) el.textContent = el.getAttribute('data-counter');
    return;
  }

  if (!('IntersectionObserver' in window)) {
    for (const el of els) animateCounter(el);
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const ent of entries) {
      if (ent.isIntersecting) {
        animateCounter(ent.target);
        io.unobserve(ent.target);
      }
    }
  }, { threshold: 0.3 });

  for (const el of els) io.observe(el);

  function animateCounter(el) {
    const raw = el.getAttribute('data-counter') || '0';
    const isPercent = raw.trim().endsWith('%');
    const num = parseFloat(raw);
    const unit = isPercent ? '%' : '';

    const duration = 900 + Math.min(600, Math.abs(num) * 2);
    const start = performance.now();
    const from = 0;

    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = from + (num - from) * eased;
      if (isPercent) el.textContent = `${Math.round(value)}${unit}`;
      else el.textContent = `${Math.round(value)}`;
      if (p < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }
}

// -------------------- Accordion (FAQ) --------------------
function initAccordion() {
  const root = $('#faq');
  if (!root) return;
  const items = $$('.accordion-item', root);
  if (!items.length) return;

  for (const item of items) {
    const btn = $('.accordion-btn', item);
    const panel = $('.accordion-panel', item);
    if (!btn || !panel) continue;

    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-expanded', 'false');
    panel.setAttribute('hidden', '');

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';

      for (const other of items) {
        const obtn = $('.accordion-btn', other);
        const opanel = $('.accordion-panel', other);
        if (!obtn || !opanel) continue;
        obtn.setAttribute('aria-expanded', 'false');
        opanel.setAttribute('hidden', '');
      }

      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        panel.removeAttribute('hidden');
      }
    });
  }
}

// -------------------- Chat demo --------------------
function createMessage(role, content, { isStreaming = false } = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = `chat-msg ${role === 'user' ? 'from-user' : 'from-assistant'}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  const text = document.createElement('div');
  text.className = 'bubble-text';

  if (isStreaming) {
    text.classList.add('streaming');
  } else {
    wrapper.classList.add('jump');
  }

  text.textContent = content || '';

  bubble.appendChild(text);
  wrapper.appendChild(bubble);
  return { wrapper, textEl: text };
}

function initChat() {
  const chatRoot = $('#demo');
  if (!chatRoot) return;

  const convoEl = $('.chat-conversation', chatRoot);
  const inputEl = $('.chat-input', chatRoot);
  const sendBtn = $('.chat-send', chatRoot);
  const quickActions = $$('.quick-actions button', chatRoot);
  const typingEl = $('.typing-indicator', chatRoot);
  const onlineEl = $('.online-indicator', chatRoot);

  if (!convoEl || !inputEl || !sendBtn) return;

  let messages = [];
  const reduce = prefersReducedMotion();
  const hasApiKey = CONFIG.MISTRAL_API_KEY && CONFIG.MISTRAL_API_KEY !== 'YOUR_MISTRAL_API_KEY_HERE';

  const welcomeMsg = 'Welcome to Ikeja Medical Center. How can I help you today?';
  const bot = createMessage('assistant', welcomeMsg);
  convoEl.appendChild(bot.wrapper);

  function setTyping(on) {
    if (!typingEl) return;
    typingEl.hidden = !on;
  }

  function setOnline(on) {
    if (!onlineEl) return;
    onlineEl.setAttribute('aria-hidden', on ? 'false' : 'true');
    onlineEl.classList.toggle('is-on', on);
  }

  setOnline(true);

  function getSimulatedResponse(userText) {
    const txt = userText.toLowerCase();
    const ci = CONFIG.CLINIC_INFO || {};

    if (txt.includes('open') || txt.includes('hour')) {
      return `We're open ${ci.openingHours || 'Monday to Saturday from 8AM to 6PM'}.`;
    }
    if (txt.includes('location') || txt.includes('address') || txt.includes('where') || txt.includes('direct')) {
      return `We are located at ${ci.address || 'Ikeja, Lagos'}. You can also tap Directions below.`;
    }
    if (txt.includes('book') || txt.includes('appointment') || txt.includes('schedule')) {
      return 'Yes. Tap Book Appointment below to get started.';
    }
    if (txt.includes('service') || txt.includes('offer')) {
      return `We offer: ${ci.services ? ci.services.join(', ') : 'general consultation and more'}.`;
    }
    if (txt.includes('doctor') || txt.includes('physician')) {
      return 'We have qualified doctors available.';
    }
    if (txt.includes('insurance') || txt.includes('hmo')) {
      return 'We work with major insurance providers. Please contact us to confirm coverage.';
    }
    if (txt.includes('emergency') || txt.includes('urgent')) {
      return ci.emergencyNote || 'Please contact a healthcare professional immediately.';
    }
    return "I'm here to help with clinic-related questions. Try asking about hours, location, or services.";
  }

  async function callMistral(userText) {
    if (!hasApiKey) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      return getSimulatedResponse(userText);
    }

    const sys = SYSTEM_PROMPT;
    const body = {
      model: 'mistral-small-latest',
      messages: [
        { role: 'system', content: sys },
        ...messages
      ],
      temperature: 0.2,
      max_tokens: 180,
      stream: false
    };

    const res = await fetch(CONFIG.MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.MISTRAL_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`API error ${res.status}`);
    }

    const data = await res.json();
    const assistant = data?.choices?.[0]?.message?.content;
    if (!assistant) throw new Error('No response');
    return String(assistant).trim();
  }

  async function send(text) {
    const clean = String(text || '').trim();
    if (!clean) return;

    inputEl.value = '';
    inputEl.blur();

    messages.push({ role: 'user', content: clean });
    const u = createMessage('user', clean);
    convoEl.appendChild(u.wrapper);

    const streaming = createMessage('assistant', '', { isStreaming: true });
    convoEl.appendChild(streaming.wrapper);

    setTyping(true);
    convoEl.scrollTop = convoEl.scrollHeight;

    try {
      const reply = await callMistral(clean);

      streaming.textEl.classList.remove('streaming');
      streaming.textEl.textContent = reply;
      streaming.wrapper.classList.add('jump');

      messages.push({ role: 'assistant', content: reply });
      setTyping(false);
      streaming.wrapper.classList.add('just-replied');
      setTimeout(() => streaming.wrapper.classList.remove('just-replied'), 600);

      if (!reduce) convoEl.scrollTo({ top: convoEl.scrollHeight, behavior: 'smooth' });
      else convoEl.scrollTop = convoEl.scrollHeight;
    } catch (err) {
      setTyping(false);
      const friendly = 'Sorry—something went wrong. Please try again.';
      streaming.textEl.classList.remove('streaming');
      streaming.textEl.textContent = friendly;
      messages.push({ role: 'assistant', content: friendly });
      streaming.wrapper.classList.add('jump');
    }
  }

  sendBtn.addEventListener('click', () => send(inputEl.value));
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      send(inputEl.value);
    }
  });

  for (const btn of quickActions) {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-question') || btn.textContent.trim();
      inputEl.value = q;
      send(q);
    });
  }
}

function init() {
  initTheme();
  initSmoothAnchors();
  initReveal();
  initMobileMenu();
  initRipples();
  initCounters();
  initAccordion();
  initChat();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


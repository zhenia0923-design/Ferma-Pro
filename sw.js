const LOGIN_PATH = new URL('login.html', self.registration.scope).pathname;
const RESET_PATH = new URL('reset.html', self.registration.scope).pathname;

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

function inject(html, script) {
  const tag = `<script>${script}<\\/script>`;
  if (html.includes('</head>')) return html.replace('</head>', `${tag}</head>`);
  return html.replace('</body>', `${tag}</body>`);
}

function responseFrom(html, original) {
  const headers = new Headers(original.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.delete('content-length');
  return new Response(html, { status: original.status, statusText: original.statusText, headers });
}

const loginEnhancer = `
(() => {
  const supa = window.supabase;
  if (!supa || typeof supa.createClient !== 'function') return;
  const originalCreateClient = supa.createClient.bind(supa);
  supa.createClient = (...args) => {
    const client = originalCreateClient(...args);
    window.__FERMA_AUTH_CLIENT = client;
    return client;
  };

  const cooldownMs = 60000;
  const rateLimitMs = 300000;
  const cooldownKey = 'ferma_auth_email_cooldown_until';
  const rateKey = 'ferma_auth_rate_limit_until';
  const getEmail = () => (document.getElementById('email')?.value || '').trim().toLowerCase();
  const setMsg = (text, ok = false) => {
    const el = document.getElementById('msg');
    if (!el) return;
    el.textContent = text;
    el.style.color = ok ? '#15803d' : '#b42318';
  };
  const remaining = key => Math.max(0, Number(localStorage.getItem(key) || 0) - Date.now());
  const startCooldown = ms => localStorage.setItem(cooldownKey, String(Date.now() + ms));
  const locked = () => remaining(rateKey) > 0;
  const readableError = error => {
    const text = String(error?.message || error || '').toLowerCase();
    if (text.includes('email rate limit exceeded') || text.includes('rate limit')) {
      localStorage.setItem(rateKey, String(Date.now() + rateLimitMs));
      return 'Supabase тимчасово обмежив відправку листів. Не натискай повторно, спробуй пізніше.';
    }
    if (text.includes('already registered') || text.includes('user already registered')) return 'Цей email уже зареєстрований. Спробуй увійти або відновити пароль.';
    if (text.includes('invalid email')) return 'Перевір правильність email.';
    if (text.includes('password')) return 'Пароль має містити щонайменше 6 символів.';
    return error?.message || 'Не вдалося виконати операцію.';
  };

  function addControls() {
    if (document.getElementById('ferma-auth-controls')) return;
    const msg = document.getElementById('msg');
    if (!msg) return;
    const box = document.createElement('div');
    box.id = 'ferma-auth-controls';
    box.style.cssText = 'display:grid;gap:8px;margin-top:10px';
    box.innerHTML = `
      <button id="ferma-resend" type="button" style="width:100%;padding:10px;border:0;border-radius:10px;background:#eef2ff;color:#1d4ed8;font-weight:700">Надіслати підтвердження ще раз</button>
      <button id="ferma-forgot" type="button" style="width:100%;padding:10px;border:0;border-radius:10px;background:#f3f4f6;color:#374151;font-weight:700">Забули пароль?</button>
      <div id="ferma-countdown" style="min-height:18px;text-align:center;font-size:12px;color:#6b7280"></div>`;
    msg.parentNode.insertBefore(box, msg.nextSibling);

    const resend = document.getElementById('ferma-resend');
    const forgot = document.getElementById('ferma-forgot');
    const countdown = document.getElementById('ferma-countdown');
    const tick = () => {
      const ms = remaining(cooldownKey);
      const rate = remaining(rateKey);
      const blocked = ms > 0 || rate > 0;
      resend.disabled = blocked;
      forgot.disabled = blocked;
      if (rate > 0) countdown.textContent = `Ліміт email: ще ${Math.ceil(rate / 60000)} хв.`;
      else if (ms > 0) countdown.textContent = `Повторно можна через ${Math.ceil(ms / 1000)} с.`;
      else countdown.textContent = '';
    };
    setInterval(tick, 1000);
    tick();

    resend.onclick = async () => {
      const email = getEmail();
      const client = window.__FERMA_AUTH_CLIENT;
      if (!email) return setMsg('Введи email.');
      if (!client) return setMsg('Модуль авторизації ще не готовий. Онови сторінку.');
      if (locked()) return tick();
      if (remaining(cooldownKey) > 0) return tick();
      resend.disabled = true;
      setMsg('Відправляю лист підтвердження...', true);
      try {
        const { error } = await client.auth.resend({ type: 'signup', email });
        startCooldown(cooldownMs);
        if (error) throw error;
        setMsg('Лист підтвердження відправлено. Перевір пошту та папку «Спам».', true);
      } catch (error) {
        setMsg(readableError(error));
      } finally { tick(); }
    };

    forgot.onclick = async () => {
      const email = getEmail();
      const client = window.__FERMA_AUTH_CLIENT;
      if (!email) return setMsg('Введи email, для якого потрібно відновити пароль.');
      if (!client) return setMsg('Модуль авторизації ще не готовий. Онови сторінку.');
      if (locked()) return tick();
      if (remaining(cooldownKey) > 0) return tick();
      forgot.disabled = true;
      setMsg('Відправляю лист для відновлення пароля...', true);
      try {
        const redirectTo = new URL('reset.html', location.href).href;
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
        startCooldown(cooldownMs);
        if (error) throw error;
        setMsg('Якщо email зареєстрований, на нього надійде лист для зміни пароля. Перевір пошту та «Спам».', true);
      } catch (error) {
        setMsg(readableError(error));
      } finally { tick(); }
    };
  }

  window.addEventListener('DOMContentLoaded', () => {
    const signup = document.getElementById('signup');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const clientReady = () => window.__FERMA_AUTH_CLIENT;
    if (signup && email && password) {
      signup.onclick = async () => {
        const value = email.value.trim().toLowerCase();
        const pass = password.value;
        if (!value) return setMsg('Введи email.');
        if (pass.length < 6) return setMsg('Пароль має містити щонайменше 6 символів.');
        if (locked() || remaining(cooldownKey) > 0) return setMsg('Зачекай перед повторною відправкою email.');
        const client = clientReady();
        if (!client) return setMsg('Модуль авторизації ще не готовий. Онови сторінку.');
        signup.disabled = true;
        setMsg('Створюю акаунт...', true);
        try {
          const { data, error } = await client.auth.signUp({ email: value, password: pass });
          startCooldown(cooldownMs);
          if (error) throw error;
          if (data?.session) setMsg('Акаунт створено. Можна працювати.', true);
          else setMsg('Акаунт створено. Підтвердь email у листі, потім увійди.', true);
        } catch (error) {
          setMsg(readableError(error));
        } finally {
          signup.disabled = false;
        }
      };
    }
    addControls();
  });
})();`;

const resetEnhancer = `
(async () => {
  const msg = document.getElementById('msg');
  const form = document.getElementById('reset-form');
  const p1 = document.getElementById('password');
  const p2 = document.getElementById('password2');
  const setMsg = (text, ok = false) => { if (msg) { msg.textContent = text; msg.style.color = ok ? '#15803d' : '#b42318'; } };
  if (!form || !p1 || !p2) return;
  try {
    const loginHtml = await fetch('login.html', { cache: 'no-store' }).then(r => r.text());
    const urlMatch = loginHtml.match(/const U='([^']+)'/);
    const keyMatch = loginHtml.match(/,K='([^']+)'/);
    if (!urlMatch || !keyMatch) throw new Error('Не знайдено конфігурацію Supabase.');
    const client = supabase.createClient(urlMatch[1], keyMatch[1], { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'sb-zfqekerozvjrpauqiqln-auth-token' } });
    let recovery = false;
    client.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') {
        recovery = true;
        setMsg('Введи новий пароль.', true);
      }
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    const { data } = await client.auth.getSession();
    if (data?.session) recovery = true;
    form.onsubmit = async event => {
      event.preventDefault();
      if (!recovery) return setMsg('Посилання для зміни пароля недійсне або вже використане. Запроси новий лист.');
      if (p1.value.length < 6) return setMsg('Пароль має містити щонайменше 6 символів.');
      if (p1.value !== p2.value) return setMsg('Паролі не збігаються.');
      const { error } = await client.auth.updateUser({ password: p1.value });
      if (error) return setMsg(error.message);
      setMsg('Пароль успішно змінено. Тепер можна увійти.', true);
      setTimeout(() => location.replace('login.html'), 1200);
    };
  } catch (error) {
    setMsg(error?.message || 'Не вдалося відкрити форму зміни пароля.');
  }
})();`;

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname !== LOGIN_PATH && url.pathname !== RESET_PATH) return;
  event.respondWith((async () => {
    const original = await fetch(event.request);
    if (!original.ok) return original;
    const text = await original.text();
    const script = url.pathname === LOGIN_PATH ? loginEnhancer : resetEnhancer;
    return responseFrom(inject(text, script), original);
  })());
});
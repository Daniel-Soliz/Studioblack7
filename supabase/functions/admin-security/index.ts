import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DEFAULT_PASSWORD_HASH = "067462d6fd87e8dcb22d7130736e6b2036021692166785531d2ca1f486aed709";
const DEFAULT_IDENTIFIERS = [
  "admin@studioblack7.com.br",
  "rayblack7@gmail.com",
  "admin",
  "rayblack7"
];
const SESSION_MS = 8 * 60 * 60 * 1000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

function serviceHeaders(extra: Record<string, string> = {}) {
  return {
    apikey: SERVICE_ROLE,
    Authorization: `Bearer ${SERVICE_ROLE}`,
    "Content-Type": "application/json",
    ...extra
  };
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function b64url(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlText(value: string) {
  return b64url(new TextEncoder().encode(value));
}

function decodeB64urlText(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(base64);
  return new TextDecoder().decode(Uint8Array.from(binary, c => c.charCodeAt(0)));
}

async function signPayload(payload: Record<string, unknown>) {
  const body = b64urlText(JSON.stringify(payload));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SERVICE_ROLE),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)));
  return `${body}.${b64url(signature)}`;
}

async function verifyToken(token: string | null) {
  if (!token || !token.includes(".")) return null;
  try {
    const [body, signature] = token.split(".");
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SERVICE_ROLE),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const base64 = signature.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((signature.length + 3) % 4);
    const binary = atob(base64);
    const sigBytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const ok = await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(body));
    if (!ok) return null;
    const payload = JSON.parse(decodeB64urlText(body));
    if (!payload?.expiresAt || Date.now() > Number(payload.expiresAt) || payload.role !== 'admin') return null;
    const config = await ensureConfig();
    if (payload.credentialVersion !== config.updated_at) return null;
    const revoked = await fetch(`${SUPABASE_URL}/rest/v1/admin_revoked_sessions?token_hash=eq.${await sha256(token)}&select=token_hash`, { headers: serviceHeaders() });
    if (!revoked.ok || (await revoked.json()).length) return null;
    return payload as { id: string; email: string; name: string; role: "admin"; expiresAt: number };
  } catch {
    return null;
  }
}

async function ensureConfig() {
  const read = await fetch(`${SUPABASE_URL}/rest/v1/admin_security_config?id=eq.1&select=*`, {
    headers: serviceHeaders()
  });
  const rows = read.ok ? await read.json() : [];
  if (Array.isArray(rows) && rows[0]) return rows[0];

  const seed = {
    id: 1,
    password_hash: DEFAULT_PASSWORD_HASH,
    session_secret: "managed-by-edge-function",
    allowed_identifiers: DEFAULT_IDENTIFIERS,
    updated_at: new Date().toISOString()
  };
  const create = await fetch(`${SUPABASE_URL}/rest/v1/admin_security_config`, {
    method: "POST",
    headers: serviceHeaders({ Prefer: "return=representation" }),
    body: JSON.stringify(seed)
  });
  if (!create.ok) throw new Error("Falha ao inicializar segurança administrativa.");
  const created = await create.json();
  return created[0] || seed;
}

function clientInfo(req: Request) {
  const ua = req.headers.get("user-agent") || "";
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ip = (forwarded.split(",")[0] || req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "").trim();
  const country = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || "";

  let deviceType = "Computador";
  if (/ipad|tablet/i.test(ua)) deviceType = "Tablet";
  else if (/android|iphone|mobile/i.test(ua)) deviceType = "Celular";

  let browser = "Outro";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\//i.test(ua)) browser = "Opera";
  else if (/chrome\//i.test(ua)) browser = "Chrome";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/safari\//i.test(ua)) browser = "Safari";

  let os = "Outro";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ios/i.test(ua)) os = "iOS";
  else if (/mac os|macintosh/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { ip, country, ua, deviceType, browser, os };
}

async function logEvent(req: Request, input: {
  event_type: string;
  identifier?: string;
  user_email?: string;
  success?: boolean;
  path?: string;
  details?: Record<string, unknown>;
}) {
  const c = clientInfo(req);
  await fetch(`${SUPABASE_URL}/rest/v1/admin_access_logs`, {
    method: "POST",
    headers: serviceHeaders({ Prefer: "return=minimal" }),
    body: JSON.stringify({
      event_type: input.event_type,
      identifier: input.identifier || null,
      user_email: input.user_email || null,
      success: input.success ?? true,
      ip_address: c.ip || null,
      country: c.country || null,
      city: null,
      user_agent: c.ua || null,
      device_type: c.deviceType,
      browser: c.browser,
      os: c.os,
      path: input.path || null,
      details: input.details || {}
    })
  });
}

function getToken(req: Request, body: any) {
  const auth = req.headers.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return typeof body?.token === "string" ? body.token : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method === "GET") return json({ ok: true, service: "admin-security" });

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "");

    if (action === "login") {
      const identifier = String(body?.email || "").trim().toLowerCase();
      const password = String(body?.password || "").trim();
      if (!identifier || !password) return json({ success: false, message: "Informe usuário/e-mail e senha." }, 400);

      const info = clientInfo(req);
      const attemptsUrl = new URL(`${SUPABASE_URL}/rest/v1/admin_access_logs`);
      attemptsUrl.searchParams.set('select','id');
      attemptsUrl.searchParams.set('event_type','eq.login_failed');
      attemptsUrl.searchParams.set('created_at',`gte.${new Date(Date.now()-15*60000).toISOString()}`);
      attemptsUrl.searchParams.set('identifier',`eq.${identifier}`);
      attemptsUrl.searchParams.set('ip_address',`eq.${info.ip || ''}`);
      attemptsUrl.searchParams.set('limit','10');
      const attempts = await fetch(attemptsUrl,{headers:serviceHeaders()});
      if (!attempts.ok) throw new Error('Não foi possível validar o acesso.');
      if ((await attempts.json()).length >= 10) return json({success:false,message:'Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.'},429);

      const config = await ensureConfig();
      const allowed = Array.isArray(config.allowed_identifiers) ? config.allowed_identifiers.map((v: unknown) => String(v).toLowerCase()) : DEFAULT_IDENTIFIERS;
      const passwordHash = await sha256(password);
      const validIdentifier = allowed.includes(identifier);
      const validPassword = passwordHash === String(config.password_hash || DEFAULT_PASSWORD_HASH);

      if (!validIdentifier || !validPassword) {
        await logEvent(req, { event_type: "login_failed", identifier, user_email: identifier.includes("@") ? identifier : undefined, success: false, path: "/admin/login" });
        return json({ success: false, message: "Credenciais inválidas. Verifique seu usuário/e-mail e senha." }, 401);
      }

      const expiresAt = Date.now() + SESSION_MS;
      const payload = {
        id: "studio-black7-admin",
        email: identifier,
        name: "Administrador Studio Black7",
        role: "admin" as const,
        credentialVersion: config.updated_at,
        nonce: crypto.randomUUID(),
        expiresAt
      };
      const token = await signPayload(payload);
      await logEvent(req, { event_type: "login_success", identifier, user_email: identifier.includes("@") ? identifier : undefined, success: true, path: "/admin/login" });
      return json({ success: true, message: "Autenticado com sucesso.", session: { ...payload, token } });
    }

    const token = getToken(req, body);
    const session = await verifyToken(token);
    if (!session) return json({ success: false, message: "Sessão administrativa inválida ou expirada." }, 401);

    if (action === "verify") {
      return json({ success: true, session });
    }

    if (action === "log") {
      const eventType = body?.eventType === "logout" ? "logout" : "admin_page_view";
      await logEvent(req, {
        event_type: eventType,
        identifier: session.email,
        user_email: session.email.includes("@") ? session.email : undefined,
        success: true,
        path: String(body?.path || "/admin"),
        details: typeof body?.details === "object" && body.details ? body.details : {}
      });
      if (eventType === 'logout') {
        const revoked = await fetch(`${SUPABASE_URL}/rest/v1/admin_revoked_sessions?on_conflict=token_hash`,{method:'POST',headers:serviceHeaders({Prefer:'resolution=ignore-duplicates'}),body:JSON.stringify({token_hash:await sha256(token!),expires_at:new Date(session.expiresAt).toISOString()})});
        if (!revoked.ok) throw new Error('Não foi possível encerrar a sessão remota.');
      }
      return json({ success: true });
    }

    if (action === "list") {
      const days = Math.min(365, Math.max(1, Number(body?.days) || 30));
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const url = new URL(`${SUPABASE_URL}/rest/v1/admin_access_logs`);
      url.searchParams.set("select", "*");
      url.searchParams.set("created_at", `gte.${since}`);
      url.searchParams.set("order", "created_at.desc");
      url.searchParams.set("limit", "500");
      const res = await fetch(url, { headers: serviceHeaders() });
      if (!res.ok) throw new Error("Não foi possível carregar o histórico de acessos.");
      const logs = await res.json();
      return json({ success: true, logs });
    }

    if (action === "change_password") {
      const currentPassword = String(body?.currentPassword || "").trim();
      const newPassword = String(body?.newPassword || "").trim();
      if (!currentPassword || newPassword.length < 6) {
        return json({ success: false, message: "Preencha a senha atual e use uma nova senha com pelo menos 6 caracteres." }, 400);
      }
      const config = await ensureConfig();
      const currentHash = await sha256(currentPassword);
      if (currentHash !== String(config.password_hash || DEFAULT_PASSWORD_HASH)) {
        return json({ success: false, message: "A senha atual informada está incorreta." }, 401);
      }
      const nextHash = await sha256(newPassword);
      const update = await fetch(`${SUPABASE_URL}/rest/v1/admin_security_config?id=eq.1`, {
        method: "PATCH",
        headers: serviceHeaders({ Prefer: "return=minimal" }),
        body: JSON.stringify({ password_hash: nextHash, updated_at: new Date().toISOString() })
      });
      if (!update.ok) throw new Error("Não foi possível atualizar a senha administrativa.");
      return json({ success: true, message: "Senha administrativa atualizada com segurança." });
    }

    return json({ success: false, message: "Ação inválida." }, 400);
  } catch (error) {
    console.error(error);
    return json({ success: false, message: "Falha temporária no serviço de segurança." }, 500);
  }
});


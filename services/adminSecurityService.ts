const SUPABASE_URL = 'https://oyghjlwujdmgfkopujip.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_kqoxjdOKFyJ1MMMlKq8X5w_aL07wxYR';
const ADMIN_SECURITY_URL = `${SUPABASE_URL}/functions/v1/admin-security`;

export type AdminAccessEvent = 'login_success' | 'login_failed' | 'admin_page_view' | 'logout';

export interface AdminAccessLogRecord {
  id: string;
  created_at: string;
  event_type: AdminAccessEvent;
  identifier?: string | null;
  user_email?: string | null;
  success: boolean;
  ip_address?: string | null;
  country?: string | null;
  city?: string | null;
  user_agent?: string | null;
  device_type?: string | null;
  browser?: string | null;
  os?: string | null;
  path?: string | null;
  details?: Record<string, unknown>;
}

async function request<T>(
  body: Record<string, unknown>,
  token?: string
): Promise<T> {
  const response = await fetch(ADMIN_SECURITY_URL, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token || SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data?.message === 'string'
        ? data.message
        : 'Não foi possível concluir a operação de segurança.';
    throw new Error(message);
  }

  return data as T;
}

export class AdminSecurityService {
  static async login(email: string, password: string) {
    return request<{
      success: boolean;
      message: string;
      session?: {
        id: string;
        email: string;
        name: string;
        role: 'admin';
        token: string;
        expiresAt: number;
      };
    }>({
      action: 'login',
      email,
      password,
    });
  }

  static async verify(token: string) {
    return request<{ success: boolean; session?: unknown }>(
      { action: 'verify' },
      token
    );
  }

  static async log(
    token: string,
    eventType: 'admin_page_view' | 'logout',
    path: string,
    details: Record<string, unknown> = {}
  ) {
    return request<{ success: boolean }>(
      {
        action: 'log',
        eventType,
        path,
        details,
      },
      token
    );
  }

  static async list(token: string, days = 30) {
    return request<{ success: boolean; logs: AdminAccessLogRecord[] }>(
      {
        action: 'list',
        days,
      },
      token
    );
  }

  static async changePassword(
    token: string,
    currentPassword: string,
    newPassword: string
  ) {
    return request<{ success: boolean; message: string }>(
      {
        action: 'change_password',
        currentPassword,
        newPassword,
      },
      token
    );
  }
}

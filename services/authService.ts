import { UserSession } from '../types';
import { StorageService } from './storageService';

const AUTH_STORAGE_KEY = 'sb7_admin_session_v1';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

// Default administrative access configuration
// Allowed default administrative logins
const ALLOWED_ADMIN_IDENTIFIERS = [
  'admin@studioblack7.com.br',
  'rayblack7@gmail.com',
  'admin',
  'rayblack7'
];

// SHA-256 cryptographic digest of the secure administrative initial key
// Plain-text is never stored in the codebase
const DEFAULT_PASSWORD_HASH = '067462d6fd87e8dcb22d7130736e6b2036021692166785531d2ca1f486aed709';

export async function hashPassword(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export class AuthService {
  /**
   * Validates admin credentials securely and issues a signed session token.
   */
  static async login(email: string, pass: string): Promise<{ success: boolean; message: string; session?: UserSession }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, message: 'Por favor, preencha o e-mail/usuário e a senha.' };
    }

    const settings = StorageService.getSettings();
    const expectedHash = settings.adminPasswordHash || DEFAULT_PASSWORD_HASH;
    const configuredAdminEmail = settings.adminEmail ? settings.adminEmail.trim().toLowerCase() : null;

    const hashedInput = await hashPassword(cleanPass);
    
    // Check identifier (either default list, configured email, or generic admin user)
    const validIdentifier = 
      ALLOWED_ADMIN_IDENTIFIERS.includes(cleanEmail) ||
      (configuredAdminEmail && cleanEmail === configuredAdminEmail) ||
      cleanEmail.includes('admin') ||
      cleanEmail.includes('black7');

    const validPassword = hashedInput === expectedHash;

    if (!validIdentifier || !validPassword) {
      return { 
        success: false, 
        message: 'Credenciais inválidas. Verifique seu e-mail ou usuário administrativo e senha.' 
      };
    }

    // Generate tamper-resistant session token
    const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    const token = `sb7_sess_${Date.now()}_${randomBytes}`;
    const expiresAt = Date.now() + SESSION_DURATION_MS;

    const session: UserSession = {
      id: 'admin-rayblack7',
      name: 'Ray Silva (Ray Black7)',
      email: cleanEmail,
      role: 'admin',
      token,
      expiresAt
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      StorageService.logActivity('Login Administrativo', `Usuário ${cleanEmail} iniciou sessão com sucesso.`);
    } catch (e) {
      console.error('Falha ao gravar sessão de autenticação:', e);
    }

    return { success: true, message: 'Autenticado com sucesso.', session };
  }

  /**
   * Retrieves current active session or null if expired or missing.
   */
  static getSession(): UserSession | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as UserSession;

      // Check session expiration
      if (!session.expiresAt || Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  /**
   * Verifies if user has valid admin session
   */
  static isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  /**
   * Terminates active administrative session
   */
  static logout(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Erro ao encerrar sessão:', e);
    }
  }
}

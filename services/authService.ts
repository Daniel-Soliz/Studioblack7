import { UserSession } from '../types';
import { AdminSecurityService } from './adminSecurityService';

const AUTH_STORAGE_KEY = 'sb7_admin_session_v2';

export class AuthService {
  static async login(
    email: string,
    pass: string
  ): Promise<{ success: boolean; message: string; session?: UserSession }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      return {
        success: false,
        message: 'Por favor, preencha o e-mail/usuário e a senha.',
      };
    }

    try {
      const result = await AdminSecurityService.login(cleanEmail, cleanPass);

      if (!result.success || !result.session) {
        return {
          success: false,
          message: result.message || 'Credenciais inválidas.',
        };
      }

      const session = result.session as UserSession;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

      // Remove a sessão antiga, que era validada somente no navegador.
      localStorage.removeItem('sb7_admin_session_v1');

      return {
        success: true,
        message: result.message || 'Autenticado com sucesso.',
        session,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Não foi possível validar o acesso administrativo.',
      };
    }
  }

  static getSession(): UserSession | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;

      const session = JSON.parse(raw) as UserSession;

      if (!session.expiresAt || Date.now() > session.expiresAt || !session.token) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  static async verifySession(): Promise<UserSession | null> {
    const session = this.getSession();
    if (!session) return null;

    try {
      const result = await AdminSecurityService.verify(session.token);
      if (!result.success) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }
      return session;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const session = this.getSession();

    if (!session) {
      return {
        success: false,
        message: 'Sua sessão expirou. Entre novamente para alterar a senha.',
      };
    }

    try {
      return await AdminSecurityService.changePassword(
        session.token,
        currentPassword,
        newPassword
      );
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Não foi possível atualizar a senha administrativa.',
      };
    }
  }

  static logout(): void {
    const session = this.getSession();

    if (session?.token) {
      void AdminSecurityService.log(
        session.token,
        'logout',
        window.location.pathname
      ).catch(() => {
        // O encerramento local da sessão não deve depender do registro remoto.
      });
    }

    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('sb7_admin_session_v1');
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
    }
  }
}

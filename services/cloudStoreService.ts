const SUPABASE_URL = 'https://oyghjlwujdmgfkopujip.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_kqoxjdOKFyJ1MMMlKq8X5w_aL07wxYR';
const SITE_DATA_URL = `${SUPABASE_URL}/rest/v1/site_data`;
const STORAGE_BUCKET = 'site-images';
const BACKEND = `${SUPABASE_URL}/functions/v1/mercado-pago-payment`;
const revisions: Record<string, string> = {};
let writes = 0;
let queue = Promise.resolve();
export const CLOUD_SYNC_EVENT = 'sb7-cloud-sync';
function adminToken() {
  try { const session = JSON.parse(localStorage.getItem('sb7_admin_session_v2') || 'null'); return session?.expiresAt > Date.now() ? session.token : ''; } catch { return ''; }
}
async function backend(body: unknown) {
  const token = adminToken();
  if (!token) throw new Error('Entre novamente no painel para salvar.');
  const response = await fetch(BACKEND, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body), cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.error || 'Não foi possível salvar no servidor.');
  return data;
}
function syncState(state: string, message?: string) { window.dispatchEvent(new CustomEvent(CLOUD_SYNC_EVENT, { detail: { state, message } })); }

export type CloudData = Record<string, unknown>;

const headers = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
  'Content-Type': 'application/json',
};

async function parseResponse(response: Response): Promise<any> {
  if (response.ok) {
    if (response.status === 204) return null;
    return response.json().catch(() => null);
  }

  const body = await response.text().catch(() => '');
  throw new Error(body || `Supabase request failed: ${response.status}`);
}

export class CloudStoreService {
  static async loadAll(): Promise<CloudData> {
    if (writes) await queue.catch(() => {});
    const rows = adminToken() ? (await backend({ action: 'admin_load' })).rows : await parseResponse(await fetch(`${SITE_DATA_URL}?select=key,value,updated_at&order=key.asc`, { headers, cache: 'no-store' }));
    const data: CloudData = {};

    (Array.isArray(rows) ? rows : []).forEach((row) => {
      if (row?.key) { data[row.key] = row.value; revisions[row.key] = row.updated_at; }
    });

    return data;
  }

  static async save(key: string, value: unknown): Promise<void> {
    writes++; syncState('saving');
    const next = queue.catch(() => {}).then(async () => {
      const data = await backend({ action: 'admin_save', key, value, expectedUpdatedAt: revisions[key] || null });
      revisions[key] = data.updatedAt;
    });
    queue = next;
    try { await next; if (writes === 1) syncState('saved'); }
    catch (error) { syncState('error', error instanceof Error ? error.message : 'Falha ao salvar.'); throw error; }
    finally { writes--; }
  }

  static async saveMany(data: CloudData): Promise<void> {
    for (const [key, value] of Object.entries(data)) await this.save(key, value);
  }

  static async order(operation: 'status' | 'save' | 'delete', orderId: string, data: unknown = {}) {
    syncState('saving');
    try { const result = await backend({ action: 'admin_order', operation, orderId, data }); syncState('saved'); return result.order; }
    catch (error) { syncState('error', error instanceof Error ? error.message : 'Falha ao salvar.'); throw error; }
  }

  static async uploadImage(file: Blob, originalName = 'image.jpg', folder = 'site'): Promise<string> {
    const extension = (() => {
      const match = originalName.toLowerCase().match(/\.([a-z0-9]+)$/);
      return match?.[1] || 'jpg';
    })();

    const uniqueName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
    const uploadUrl = `${BACKEND}?action=upload&folder=${encodeURIComponent(folder)}`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken()}`,
        'Content-Type': file.type || 'image/jpeg',
        'x-upsert': 'false',
        'cache-control': '31536000',
      },
      body: file,
    });

    const result = await parseResponse(response);
    return result.url;
  }

  static async uploadImageFromFile(
    file: File,
    folder = 'site',
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.86
  ): Promise<string> {
    const blob = await this.compressImage(file, maxWidth, maxHeight, quality);
    return this.uploadImage(blob, file.name, folder);
  }

  static async compressImage(
    file: File,
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.86
  ): Promise<Blob> {
    const imageUrl = URL.createObjectURL(file);

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Não foi possível processar a imagem.'));
        img.src = imageUrl;
      });

      let width = image.naturalWidth || image.width;
      let height = image.naturalHeight || image.height;
      const scale = Math.min(1, maxWidth / width, maxHeight / height);
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (!context) throw new Error('Seu navegador não conseguiu preparar a imagem.');

      context.drawImage(image, 0, 0, width, height);

      return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Não foi possível compactar a imagem.'));
          },
          'image/jpeg',
          quality
        );
      });
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }
}

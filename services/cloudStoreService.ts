const SUPABASE_URL = 'https://oyghjlwujdmgfkopujip.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_kqoxjdOKFyJ1MMMlKq8X5w_aL07wxYR';
const SITE_DATA_URL = `${SUPABASE_URL}/rest/v1/site_data`;
const STORAGE_BUCKET = 'site-images';

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
    const response = await fetch(`${SITE_DATA_URL}?select=key,value&order=key.asc`, {
      headers,
      cache: 'no-store',
    });

    const rows = await parseResponse(response);
    const data: CloudData = {};

    (Array.isArray(rows) ? rows : []).forEach((row) => {
      if (row?.key) data[row.key] = row.value;
    });

    return data;
  }

  static async save(key: string, value: unknown): Promise<void> {
    const response = await fetch(`${SITE_DATA_URL}?on_conflict=key`, {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        key,
        value,
        updated_at: new Date().toISOString(),
      }),
    });

    await parseResponse(response);
  }

  static async saveMany(data: CloudData): Promise<void> {
    const rows = Object.entries(data).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

    if (!rows.length) return;

    const response = await fetch(`${SITE_DATA_URL}?on_conflict=key`, {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(rows),
    });

    await parseResponse(response);
  }

  static async uploadImage(file: Blob, originalName = 'image.jpg', folder = 'site'): Promise<string> {
    const extension = (() => {
      const match = originalName.toLowerCase().match(/\.([a-z0-9]+)$/);
      return match?.[1] || 'jpg';
    })();

    const uniqueName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${uniqueName}`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        'Content-Type': file.type || 'image/jpeg',
        'x-upsert': 'false',
        'cache-control': '31536000',
      },
      body: file,
    });

    await parseResponse(response);

    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${uniqueName}`;
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

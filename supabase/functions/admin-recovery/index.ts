import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const base = Deno.env.get('SUPABASE_URL')!;
const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const headers = { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' };
const cors = { 'Access-Control-Allow-Origin': 'https://studioblack7.com.br', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), {status, headers: cors});
async function hash(value: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))).map(b => b.toString(16).padStart(2,'0')).join('');
}
async function rpc(name: string, body: unknown) {
  const response = await fetch(`${base}/rest/v1/rpc/${name}`, {method:'POST',headers,body:JSON.stringify(body)});
  if (!response.ok) throw new Error('Database operation failed');
  return response.json();
}
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null,{headers:cors});
  if (req.method !== 'POST') return reply({message:'Método inválido.'},405);
  try {
    const body = await req.json();
    if (body.action === 'request') {
      const key = Deno.env.get('RESEND_API_KEY');
      if (!key) return reply({success:false,message:'O envio por e-mail ainda precisa ser ativado pelo administrador.'},503);
      const email = String(body.email || '').trim().toLowerCase();
      if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({message:'Informe um e-mail válido.'},400);
      const token = crypto.randomUUID().replaceAll('-','') + crypto.randomUUID().replaceAll('-','');
      const tokenHash = await hash(token);
      const issued = await rpc('issue_admin_recovery',{p_email:email,p_token_hash:tokenHash});
      if (issued) {
        const link = `https://studioblack7.com.br/admin/login#recovery=${token}`;
        const sent = await fetch('https://api.resend.com/emails',{
          method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':tokenHash},
          body:JSON.stringify({from:Deno.env.get('RECOVERY_EMAIL_FROM') || 'Studio Black7 <onboarding@resend.dev>',to:[email],subject:'Redefina sua senha — Studio Black7',text:`Para definir uma nova senha do ADM, abra:\n${link}\n\nO link expira em 15 minutos e funciona uma única vez. Se você não pediu esta alteração, ignore este e-mail.`})
        });
        if (!sent.ok) {
          await fetch(`${base}/rest/v1/admin_password_recovery?token_hash=eq.${tokenHash}`,{method:'PATCH',headers,body:JSON.stringify({consumed_at:new Date().toISOString()})});
          return reply({success:false,message:'Não foi possível enviar o e-mail. Confira a configuração de envio e tente novamente mais tarde.'},502);
        }
      }
      return reply({success:true,message:'Se o e-mail estiver autorizado e o limite de envio permitir, você receberá um link. Confira também o spam. Aguarde um minuto antes de tentar novamente.'});
    }
    if (body.action === 'reset') {
      const token = String(body.token || '');
      const password = String(body.password || '').trim();
      if (!/^[0-9a-f]{64}$/.test(token)) return reply({message:'Link inválido. Solicite uma nova recuperação.'},400);
      if (password.length < 10 || password.length > 128) return reply({message:'Use uma senha com 10 a 128 caracteres.'},400);
      const success = await rpc('consume_admin_recovery',{p_token_hash:await hash(token),p_password_hash:await hash(password)});
      return success ? reply({success:true,message:'Senha atualizada! Entre com seu usuário administrativo e a nova senha.'}) : reply({success:false,message:'Este link venceu ou já foi utilizado. Solicite uma nova recuperação.'},400);
    }
    return reply({message:'Ação inválida.'},400);
  } catch {
    return reply({success:false,message:'Não foi possível concluir a recuperação. Tente novamente mais tarde.'},500);
  }
});

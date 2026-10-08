import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { transformSync } from 'esbuild';

const fixtures = { checkoutId:'11111111-1111-4111-8111-111111111111',clientToken:'22222222-2222-4222-8222-222222222222' };
const source = fs.readFileSync('supabase/functions/mercado-pago-payment/index.ts','utf8').replace(/^import .*edge-runtime.*;\n/,'');
const code=transformSync(source,{loader:'ts',format:'iife',target:'es2022'}).code;
async function run(body, scenario = {}) {
  let handler; const calls=[];
  const record={id:fixtures.checkoutId,client_token:fixtures.clientToken,state:'pending',mp_order_id:'ORDFIXTURE',order_data:{id:'ord-fixture',total:115,customer:{email:'buyer@example.invalid'},items:[]},...scenario.record};
  const fetch=async(url,options={})=>{
    calls.push({url:String(url),options,body:options.body?JSON.parse(options.body):null});
    const path=String(url);
    if(path.endsWith('/admin-security')) return Response.json({success:false},{status:401});
    if(path.includes('/store_checkouts?')) return Response.json([record]);
    if(path.endsWith('/rpc/store_checkout_command')) {
      const request=JSON.parse(options.body);
      if(scenario.stockError&&request.p_action==='reserve')return Response.json({message:'Produto indisponível nessa quantidade.'},{status:400});
      return Response.json({...record,state:request.p_action==='reserve'?'creating':request.p_action==='paid'?'paid':record.state});
    }
    if(path==='https://api.mercadopago.com/v1/orders') return Response.json({id:'ORDFIXTURE',status:'action_required',transactions:{payments:[{id:'PAYFIXTURE',payment_method:{qr_code:'fixture',qr_code_base64:'fixture'}}]}});
    if(path==='https://api.mercadopago.com/v1/orders/ORDFIXTURE')return Response.json(scenario.provider||{status:'action_required',status_detail:'waiting_payment',total_amount:'115.00'});
    if(path.endsWith('/cancel')) return Response.json({status:'cancelled'});
    throw new Error('Unexpected request '+path);
  };
  vm.runInNewContext(code,{Deno:{env:{get:k=>({SUPABASE_URL:'https://fixture.invalid',SUPABASE_SERVICE_ROLE_KEY:'test-only',MERCADO_PAGO_ACCESS_TOKEN:'test-only'})[k]},serve:h=>{handler=h;}},fetch,Response,Request,URL,AbortSignal,crypto:webcrypto,console});
  const response=await handler(new Request('https://fixture.invalid/functions/v1/mercado-pago-payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
  return {status:response.status,data:await response.json(),calls};
}
const create={action:'create_pix',kind:'store',...fixtures,customer:{name:'Fixture Buyer',email:'buyer@example.invalid',phone:'11999999999',address:{street:'Fixture',number:'1',postalCode:'01234000'}},shippingMethod:'Entrega Expressa Zona Norte',items:[{productId:'fixture',quantity:1}]};
let r=await run(create,{record:{state:'creating',mp_order_id:null}});
assert.equal(r.status,200);assert.equal(r.data.amount,115);assert.equal(r.data.order.total,115);
const mp=r.calls.find(c=>c.url==='https://api.mercadopago.com/v1/orders');
assert.equal(mp.body.total_amount,'115.00');assert.equal(mp.options.headers['X-Idempotency-Key'],fixtures.checkoutId);assert.equal(mp.body.payer.email,'buyer@example.invalid');
r=await run(create,{stockError:true});assert.equal(r.status,400);assert.equal(r.calls.filter(c=>c.url.startsWith('https://api.mercadopago.com')).length,0);
r=await run({action:'check_status',kind:'store',orderId:'ORDFIXTURE',clientToken:'wrong'});assert.equal(r.status,404);assert.equal(r.calls.filter(c=>c.url.startsWith('https://api.mercadopago.com')).length,0);
r=await run({action:'admin_load'});assert.equal(r.status,401);
r=await run({action:'cancel_order',kind:'store',orderId:'ORDFIXTURE',clientToken:fixtures.clientToken},{provider:{status:'processed',status_detail:'accredited',total_paid_amount:'115.00'}});assert.equal(r.status,409);assert.equal(r.calls.filter(c=>c.url.endsWith('/cancel')).length,0);assert.equal(r.calls.filter(c=>c.body?.p_action==='close').length,0);
r=await run({type:'order',data:{id:'ORDFIXTURE',status:'processed',status_detail:'accredited',total_paid_amount:'115.00'}});assert.equal(r.status,200);assert.equal(r.calls.filter(c=>c.body?.p_action==='paid').length,0);
r=await run({action:'check_status',kind:'store',orderId:'ORDFIXTURE',clientToken:fixtures.clientToken},{provider:{status:'processed',status_detail:'accredited',total_paid_amount:'1.00'}});assert.equal(r.status,400);assert.equal(r.calls.filter(c=>c.body?.p_action==='paid').length,0);
r=await run({action:'cancel_order',kind:'store',orderId:'ORDFIXTURE',clientToken:fixtures.clientToken});assert.equal(r.status,200);assert.equal(r.calls.filter(c=>c.body?.p_action==='close').length,1);

const manifest=JSON.parse(fs.readFileSync('public/manifest.webmanifest','utf8'));
assert.equal(manifest.start_url,'/Studioblack7/');assert.equal(manifest.scope,'/Studioblack7/');assert.equal(manifest.display,'standalone');
for(const icon of manifest.icons){const bytes=fs.readFileSync('public/'+icon.src);assert.equal(bytes.readUInt32BE(16),Number(icon.sizes.split('x')[0]));assert.equal(bytes.readUInt32BE(20),Number(icon.sizes.split('x')[1]));}
const swListeners={};vm.runInNewContext(fs.readFileSync('public/sw.js','utf8'),{URL,self:{location:{origin:'https://fixture.invalid'},addEventListener:(name,handler)=>{swListeners[name]=handler;}},caches:{},fetch:()=>{throw new Error('unexpected network');}});
let intercepted=false;swListeners.fetch({request:new Request('https://database.invalid/rest/v1/site_data'),respondWith:()=>{intercepted=true;}});assert.equal(intercepted,false);
swListeners.fetch({request:new Request('https://fixture.invalid/Studioblack7/agendar',{method:'POST'}),respondWith:()=>{intercepted=true;}});assert.equal(intercepted,false);
console.log('PASS: server totals, freight, idempotency, stock failure, private access, cancellation, forged notifications, amount mismatch, PWA icon dimensions/scope and API cache isolation. No real payment created.');

const authCode = transformSync(fs.readFileSync('supabase/functions/admin-security/index.ts','utf8').replace(/^import .*edge-runtime.*;\n/,''),{loader:'ts',format:'iife',target:'es2022'}).code;
let authHandler; const revoked = new Set(); let failures=0;
const testHash=Buffer.from(await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode('test-password-only'))).toString('hex');
const config={id:1,password_hash:testHash,updated_at:'2026-10-08T00:00:00.000Z',allowed_identifiers:['admin']};
const authFetch=async(url,options={})=>{
  const path=String(url);
  if(path.includes('/admin_security_config')) { if(options.method==='PATCH'){Object.assign(config,JSON.parse(options.body));return new Response(null,{status:204});} return Response.json([config]); }
  if(path.includes('/admin_access_logs')) { if(options.method==='POST')return new Response(null,{status:204});return Response.json(Array.from({length:failures},()=>({id:'fixture'}))); }
  if(path.includes('/admin_revoked_sessions')) { if(options.method==='POST'){revoked.add(JSON.parse(options.body).token_hash);return new Response(null,{status:204});} const hash=new URL(path).searchParams.get('token_hash').slice(3);return Response.json(revoked.has(hash)?[{token_hash:hash}]:[]); }
  throw new Error('Unexpected auth request '+path);
};
vm.runInNewContext(authCode,{Deno:{env:{get:k=>({SUPABASE_URL:'https://fixture.invalid',SUPABASE_SERVICE_ROLE_KEY:'test-only'})[k]},serve:h=>{authHandler=h;}},fetch:authFetch,Response,Request,URL,crypto:webcrypto,console,TextEncoder,TextDecoder,btoa,atob});
async function auth(body){const response=await authHandler(new Request('https://fixture.invalid',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));return {status:response.status,data:await response.json()};}
let a=await auth({action:'login',email:'admin',password:'test-password-only'});assert.equal(a.status,200);const token=a.data.session.token;
a=await auth({action:'verify',token});assert.equal(a.status,200);
a=await auth({action:'verify',token:token+'tampered'});assert.equal(a.status,401);
a=await auth({action:'log',eventType:'logout',token});assert.equal(a.status,200);
a=await auth({action:'verify',token});assert.equal(a.status,401);
a=await auth({action:'login',email:'admin',password:'test-password-only'});const fresh=a.data.session.token;assert.notEqual(fresh,token);
config.updated_at='2026-10-08T00:01:00.000Z';a=await auth({action:'verify',token:fresh});assert.equal(a.status,401);
failures=10;a=await auth({action:'login',email:'admin',password:'test-password-only'});assert.equal(a.status,429);
console.log('PASS: signed administrator login, forged token refusal, remote logout revocation, credential-version invalidation and login throttling (isolated fixtures).');

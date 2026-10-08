import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire(process.env.RBI_PLAYWRIGHT_PACKAGE ?? import.meta.url)('playwright');
import { createAdapter, DEMO_KEY, ApiError } from '../../resources/js/cms/adapter.ts';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=fileURLToPath(new URL('../../docs/ui-qa',import.meta.url));
const baseUrl=process.env.RBI_QA_BASE_URL ?? 'http://127.0.0.1:8765';
let saved;
const seed=createAdapter({demo:true,storage:{getItem:()=>null,setItem:(_,value)=>{saved=value}}});
await seed.request('brands/1/services',{method:'POST',body:{name:'Fixture seed'}});
const state=JSON.parse(saved);
for(let i=1;i<=25;i++) state['brands/1/pages'].push({id:900+i,title:'Halaman '+i,slug:'halaman-'+i,status:'draft',body:'Fixture halaman'});
state['brands/1/banners']=[{id:9901,page_id:925,title:'Banner halaman lanjut',image_url:'https://example.test/banner.png',position:0,status:'draft'}];
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
async function scenario(name,user,run){
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const fixture=createAdapter({demo:true,storage:{getItem:()=>JSON.stringify(state),setItem:()=>{}}});
 const calls=[];let createdId,failedRead=false;
 await page.route(/\/cms\/(?:demo(?:\/[^/?]+)?|nusa-stay)(?:\?.*)?$/,async route=>{
  const response=await route.fetch({url:route.request().url().replace('/cms/nusa-stay','/cms/demo/nusa-stay')});let html=await response.text();
  const match=html.match(/(<script data-page="app" type="application\/json">)([\s\S]*?)(<\/script>)/);
  assert.ok(match);
  const payload=JSON.parse(match[2]);payload.props.demo=false;payload.props.cmsUser=user;payload.props.cmsBrand=state.brands.find(brand=>brand.slug===payload.props.cmsBrandSlug)??null;payload.props.cmsRoles={'1':user.id===90?'company_admin':'company_editor'};
  html=html.replace(match[0],match[1]+JSON.stringify(payload)+match[3]);
  await route.fulfill({response,body:html});
 });
 await page.route('**/api/v1/cms/**',async route=>{
  const req=route.request(),url=new URL(req.url()),path=url.pathname.replace('/api/v1/cms/','');
  calls.push({method:req.method(),path});
  if(name.includes('verification') && path===`brands/1/services/${createdId}` && req.method()==='GET'&&!failedRead){failedRead=true;await route.fulfill({status:502,json:{message:'Read-back interrupted (controlled test fixture)',errors:{}}});return;}
  try{
   let result=await fixture.request(path,{method:req.method(),body:req.postDataJSON()??undefined,query:Object.fromEntries(url.searchParams)});
   if(path==='brands'&&req.method()==='GET'){result={...result,data:result.data.filter(b=>b.id===1),meta:{current_page:1,last_page:1,per_page:12,total:1}};}
   if(path==='brands/1/services'&&req.method()==='POST')createdId=result.data.id;
   await route.fulfill({status:req.method()==='POST'?201:req.method()==='DELETE'?204:200,...(req.method()==='DELETE'?{}:{json:result})});
  }catch(e){await route.fulfill({status:e instanceof ApiError?e.status:500,json:{message:e.message,errors:e.fields??{}}});}
 });
 try{
  await page.goto(baseUrl+'/cms/demo',{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Kelola brand',exact:true}).click();
  await run(page,calls);
  results.push({name,passed:true,calls});console.log('PASS MOCK',name);
 }catch(e){results.push({name,passed:false,message:e.message,calls});console.log('FAIL MOCK',name,e.message);await page.screenshot({path:out+'/mock-regression-'+results.length+'.png',fullPage:true});}
 finally{await page.close();}
}
await scenario('Banner permissions independent of paginated picker',{id:88,name:'Editor test',email:'editor@example.test',is_super_admin:false},async(page,calls)=>{
 await page.getByRole('button',{name:'Banner',exact:true}).click();
 await page.getByRole('button',{name:'Edit Banner halaman lanjut',exact:true}).waitFor({timeout:5000});
 assert.ok(calls.some(c=>c.path==='brands/1/pages/925'&&c.method==='GET'));
 await page.getByRole('button',{name:'Edit Banner halaman lanjut',exact:true}).click();
 await page.getByRole('dialog').waitFor();
});
await scenario('Successful POST then failed verification retries GET only',{id:89,name:'Admin test',email:'admin@example.test',is_super_admin:true},async(page,calls)=>{
 await page.getByRole('button',{name:'Layanan',exact:true}).click();
 await page.getByRole('button',{name:'Tambah layanan',exact:true}).click();
 const dialog=page.getByRole('dialog');await dialog.getByLabel(/^Nama/).fill('QA Simpan sekali');
 await dialog.getByRole('button',{name:'Simpan perubahan',exact:true}).click();
 await dialog.getByRole('alert').waitFor();
 console.log('FIRST SAVE MESSAGE',await dialog.getByRole('alert').innerText());
 const retry=dialog.getByRole('button',{name:/^(Coba verifikasi|Verifikasi ulang|Simpan perubahan)$/});
 const buttons=await retry.all();let clicked=false;for(const button of buttons){if(await button.isEnabled()){await button.click();clicked=true;break;}}assert.equal(clicked,true);
 await dialog.waitFor({state:'hidden',timeout:5000});
 assert.equal(calls.filter(c=>c.method==='POST'&&c.path==='brands/1/services').length,1,'A committed POST must not be retried after read-back failure');
});
for (const user of [
 {id:90,name:'Company admin test',email:'company-admin@example.test',is_super_admin:false},
 {id:91,name:'Super admin test',email:'super-admin@example.test',is_super_admin:true},
]) await scenario('Administrator banner preserves off-picker selection '+user.id,user,async(page,calls)=>{
 await page.getByRole('button',{name:'Banner',exact:true}).click();
 await page.getByRole('button',{name:'Edit Banner halaman lanjut',exact:true}).click();
 const dialog=page.getByRole('dialog');await dialog.waitFor();
 assert.equal(await dialog.getByLabel(/^Halaman/).inputValue(),'925','Existing parent must stay selected outside picker batch');
 assert.ok(calls.some(c=>c.path==='brands/1/pages/925'&&c.method==='GET'));
});
console.log(JSON.stringify(results,null,2));await fs.writeFile(out+'/mock-regression-results.json',JSON.stringify({scope:'Controlled intercepted API fixtures only; not authenticated production verification',results},null,2));
await browser.close();if(results.some(r=>!r.passed))process.exitCode=1;

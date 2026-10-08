import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.RBI_PLAYWRIGHT_PACKAGE??import.meta.url)('playwright');
const base=process.env.RBI_QA_BASE_URL??'http://127.0.0.1:8765';
const definition=JSON.parse(await fs.readFile(process.env.RBI_ACALA_DEFINITION??'C:/Users/novap/AppData/Local/hermes/cache/scratch/acala-definition.json','utf8'));
const source=JSON.parse(await fs.readFile(new URL('../../database/data/acala/source.json',import.meta.url),'utf8'));
const out=fileURLToPath(new URL('../../docs/ui-qa/',import.meta.url));
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
async function scenario(name,admin,run){
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const records={'content-blocks':source.contents.map((r,i)=>({...structuredClone(r),id:i+1})),datasets:source.datasets.map((r,i)=>({...structuredClone(r),id:i+1})),'image-slots':source.images.map((r,i)=>({...structuredClone(r),id:i+1}))};
 const calls=[],errors=[];let pendingId=null,failed=false;
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/cms/demo/nusa-stay',async route=>{
  const response=await route.fetch();let html=await response.text();const match=html.match(/(<script data-page="app" type="application\/json">)([\s\S]*?)(<\/script>)/);assert.ok(match);
  const payload=JSON.parse(match[2]);Object.assign(payload.props,{demo:false,cmsBrandSlug:'acala',cmsBrand:{id:901,name:'Acala',slug:'acala',cms_driver:'acala',active:false,status:'draft'},cmsUser:{id:900,name:'QA controlled fixture',email:'qa@example.test',is_super_admin:admin},cmsRoles:{'901':admin?'company_admin':'company_editor'}});
  await route.fulfill({response,body:html.replace(match[0],match[1]+JSON.stringify(payload)+match[3])});
 });
 await page.route('**/api/v1/cms/**',async route=>{
  const req=route.request(),url=new URL(req.url()),path=url.pathname.replace('/api/v1/cms/',''),method=req.method();calls.push({path,method,query:Object.fromEntries(url.searchParams)});
  if(path==='brands'){await route.fulfill({json:{data:[{id:901,name:'Acala',slug:'acala',cms_driver:'acala'}],meta:{current_page:1,last_page:1,total:1}}});return;}
  if(path==='brands/901/definition'){await route.fulfill({json:{data:definition}});return;}
  const [,brandId,module,id]=path.split('/');assert.equal(brandId,'901');assert.ok(records[module],path);
  if(method==='PATCH'){
   const row=records[module].find(r=>r.id===Number(id));Object.assign(row,req.postDataJSON());pendingId=path;await route.fulfill({json:{data:row}});return;
  }
  if(id){
   if(path===pendingId&&!failed){failed=true;await route.fulfill({status:502,json:{message:'Controlled read-back interruption'}});return;}
   await route.fulfill({json:{data:records[module].find(r=>r.id===Number(id))}});return;
  }
  let rows=records[module];if(module==='content-blocks')rows=rows.filter(r=>r.page===url.searchParams.get('page_key'));
  const number=Number(url.searchParams.get('page')??1),size=Number(url.searchParams.get('per_page')??20);const total=rows.length;
  rows=rows.slice((number-1)*size,number*size).map(({body,metadata,data,...summary})=>summary);
  await route.fulfill({json:{data:rows,meta:{current_page:number,last_page:Math.max(1,Math.ceil(total/size)),per_page:size,total},links:{}}});
 });
 try{await page.goto(base+'/cms/demo/nusa-stay',{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Konten Acala',exact:true}).waitFor();await run(page,calls,records);assert.deepEqual(errors,[]);await page.screenshot({path:out+'acala-'+results.length+'.png',fullPage:true});results.push({name,passed:true,errors,calls});console.log('PASS CONTROLLED',name);}
 catch(error){results.push({name,passed:false,message:error.message,errors,calls});await page.screenshot({path:out+'acala-failure-'+results.length+'.png',fullPage:true});console.error('FAIL',name,error.message);}
 finally{await page.close();}
}
await scenario('Acala page-specific content and save verification retry',true,async(page,calls,records)=>{
 assert.equal(await page.getByRole('combobox',{name:'Pilih halaman Acala'}).inputValue(),'home');
 assert.ok(calls.some(c=>c.path==='brands/901/content-blocks'&&c.query.page_key==='home'&&c.query.per_page==='20'));
 assert.equal(calls.some(c=>c.path.includes('/datasets')||c.path.includes('/image-slots')),false);
 await page.locator('tbody tr').first().getByRole('button',{name:'Edit detail',exact:true}).click();
 const dialog=page.getByRole('dialog');await dialog.waitFor();assert.equal(await dialog.getByLabel(/^Halaman/).inputValue(),'home');
 await dialog.getByLabel('Judul',{exact:true}).fill('Acala QA terverifikasi');
 await dialog.getByRole('button',{name:'Simpan & verifikasi',exact:true}).click();await dialog.getByRole('button',{name:'Verifikasi ulang (GET saja)',exact:true}).waitFor();
 assert.equal(await dialog.getByLabel('Judul',{exact:true}).isDisabled(),true);
 await dialog.getByRole('button',{name:'Verifikasi ulang (GET saja)',exact:true}).click();await dialog.waitFor({state:'hidden'});
 assert.equal(calls.filter(c=>c.method==='PATCH').length,1);assert.equal(records['content-blocks'][0].title,'Acala QA terverifikasi');
 await page.getByRole('combobox',{name:'Pilih halaman Acala'}).selectOption('about');await page.waitForFunction(()=>document.querySelector('tbody tr small')?.textContent?.trim()==='about');
});
await scenario('Acala dataset detail JSON and image-slot pagination',true,async(page,calls)=>{
 await page.getByRole('button',{name:'Data Acala',exact:true}).click();await page.locator('tbody tr').first().getByRole('button',{name:'Edit detail',exact:true}).click();const dialog=page.getByRole('dialog');await dialog.waitFor();
 const value=JSON.parse(await dialog.getByLabel(/^Data JSON/).inputValue());assert.ok(Array.isArray(value));assert.ok(value.some(branch=>branch.slug==='nusa-dua'));
 assert.ok(calls.some(c=>c.path==='brands/901/datasets/1'));
 await dialog.getByRole('button',{name:'Tutup',exact:true}).click();await page.getByRole('button',{name:'Gambar Acala',exact:true}).click();await page.locator('tbody tr').first().waitFor();
 assert.equal(await page.locator('tbody tr').count(),20);await page.getByRole('button',{name:'Berikutnya',exact:true}).click();await page.waitForFunction(()=>document.querySelector('tbody')?.children.length===12);
});
await scenario('Acala editor cannot edit published content or publish drafts',false,async(page)=>{
 await page.getByText('Hanya administrator',{exact:true}).first().waitFor();assert.equal(await page.getByRole('button',{name:'Edit detail',exact:true}).count(),0);
 await page.getByRole('button',{name:'Tambah Konten Acala',exact:true}).click();const dialog=page.getByRole('dialog');await dialog.waitFor();assert.equal(await dialog.getByLabel('Terbit',{exact:true}).isDisabled(),true);await dialog.getByRole('button',{name:'Tutup',exact:true}).click();
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Buka navigasi',exact:true}).click();await page.getByRole('button',{name:'Data Acala',exact:true}).click();await page.getByRole('heading',{name:'Data Acala',exact:true}).waitFor();
 await page.getByRole('button',{name:'Buka navigasi',exact:true}).click();await page.getByRole('button',{name:'Gambar Acala',exact:true}).click();await page.getByRole('heading',{name:'Gambar Acala',exact:true}).waitFor();await page.locator('tbody tr').first().waitFor();
 assert.equal(await page.getByRole('button',{name:'Edit detail',exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:'Tambah Gambar Acala',exact:true}).count(),0);
});
await scenario('Dataset null and scalar JSON remain editable through the mounted form',true,async(page,calls,records)=>{
 records.datasets[0].data=null;
 await page.getByRole('button',{name:'Data Acala',exact:true}).click();await page.locator('tbody tr').first().getByRole('button',{name:'Edit detail',exact:true}).click();const dialog=page.getByRole('dialog');await dialog.waitFor();
 assert.equal(await dialog.getByLabel(/^Data JSON/).inputValue(),'null');await dialog.getByLabel(/^Data JSON/).fill('false');
 await dialog.getByRole('button',{name:'Simpan & verifikasi',exact:true}).click();await dialog.getByRole('button',{name:'Verifikasi ulang (GET saja)',exact:true}).click();await dialog.waitFor({state:'hidden'});
 assert.equal(calls.filter(c=>c.method==='PATCH').length,1);assert.equal(records.datasets[0].data,false);
});
await fs.writeFile(out+'acala-results.json',JSON.stringify({scope:'Actual mounted React against Laravel with explicit intercepted API fixtures built from real repository snapshot and server definition; not production auth/CRUD',results},null,2));
await browser.close();if(results.some(r=>!r.passed))process.exitCode=1;

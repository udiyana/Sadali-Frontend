import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createAdapter, DEMO_KEY } from '../../resources/js/cms/adapter.ts';
const { chromium } = createRequire(process.env.RBI_PLAYWRIGHT_PACKAGE ?? import.meta.url)('playwright');
const base = process.env.RBI_QA_BASE_URL ?? 'http://127.0.0.1:8765';
const out = fileURLToPath(new URL('../../docs/ui-qa/', import.meta.url));
let saved;
const adapter = createAdapter({demo:true,storage:{getItem:()=>null,setItem:(_,value)=>{saved=value;}}});
const fixtures = [
 {id:1,slug:'nusa-stay',name:'Nusa Stay',service:'QA khusus Nusa'},
 {id:2,slug:'sora-kitchen',name:'Sora Kitchen',service:'QA khusus Sora'},
 {id:3,slug:'aruna-wellness',name:'Aruna Wellness',service:'QA khusus Aruna'},
];
for (const brand of fixtures) await adapter.request(`brands/${brand.id}/services`,{method:'POST',body:{name:brand.service}});
const browser = await chromium.launch({channel:'chrome',headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1000}});
const errors = [], apiRequests = [], checks = [];
page.on('pageerror',error=>errors.push(error.message));
page.on('request',request=>{if(request.url().includes('/api/v1/cms/'))apiRequests.push({method:request.method(),url:request.url()});});
await page.addInitScript(({key,value})=>{if(!localStorage.getItem(key))localStorage.setItem(key,value);},{key:DEMO_KEY,value:saved});
try {
 await page.goto(base+'/cms/demo',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Kelola brand',exact:true}).first().click();
 await page.waitForURL(base+'/cms/demo/nusa-stay');
 checks.push('Brand card opens its scoped URL');
 for (const brand of fixtures) {
  await page.goto(base+'/cms/demo/'+brand.slug,{waitUntil:'networkidle'});
  const picker=page.getByRole('combobox',{name:'Pilih brand workspace'});
  await picker.waitFor();
  await page.waitForFunction(id=>document.querySelector('select[aria-label="Pilih brand workspace"]')?.value===String(id),brand.id);
  assert.equal(await picker.inputValue(),String(brand.id));
  checks.push('Direct URL selects '+brand.name);
  await page.getByRole('button',{name:'Layanan',exact:true}).click();
  await page.getByText(brand.service,{exact:true}).waitFor();
  for (const other of fixtures.filter(item=>item.id!==brand.id))assert.equal(await page.getByText(other.service,{exact:true}).count(),0);
  assert.equal(new URL(page.url()).pathname,'/cms/demo/'+brand.slug);
  checks.push('Services remain isolated for '+brand.name);
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await picker.inputValue(),String(brand.id));
  checks.push('Refresh preserves '+brand.name);
 }
 await page.getByRole('combobox',{name:'Pilih brand workspace'}).selectOption('2');
 await page.waitForURL(base+'/cms/demo/sora-kitchen');
 await page.getByRole('button',{name:'Layanan',exact:true}).click();
 await page.getByText('QA khusus Sora',{exact:true}).waitFor();
 assert.equal(await page.getByText('QA khusus Aruna',{exact:true}).count(),0);
 checks.push('Top-left picker navigates to another brand URL with no old-brand content');
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Buka navigasi',exact:true}).click();
 await page.getByRole('combobox',{name:'Pilih brand workspace'}).selectOption('1');
 await page.waitForURL(base+'/cms/demo/nusa-stay');
 checks.push('Mobile workspace picker navigates to brand URL');
 assert.deepEqual(errors,[]);assert.deepEqual(apiRequests,[]);
 checks.push('No JavaScript errors or live API requests in demo');
 await page.setViewportSize({width:1440,height:1000});
 await page.screenshot({path:out+'brand-workspace.png',fullPage:true});
 const result={passed:true,scope:'Actual demo UI against Laravel; disposable seeded browser localStorage, no production DB',checks,errors,apiRequests};
 await fs.writeFile(out+'workspace-results.json',JSON.stringify(result,null,2));
 console.log(JSON.stringify(result,null,2));
} catch(error) {
 await page.screenshot({path:out+'workspace-failure.png',fullPage:true});
 console.error(error);process.exitCode=1;
} finally {await browser.close();}

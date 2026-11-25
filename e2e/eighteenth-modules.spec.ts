import {test,expect} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {randomUUID} from 'node:crypto';
import {blankPlan} from '../src/features/events/baptism/model';
import {createQaIdentity,createLocationSupplierFixture,deleteLocationSupplierFixture,deleteQaIdentity,login,waitForPublicCatalogFixture,type LocationSupplierFixture} from './helpers/milestone8-fixtures';
test('[18] suppliers and venue saved, reopened and isolated from wedding and baptism',async({page})=>{
 test.setTimeout(180000);
 const url=process.env.PLAYWRIGHT_SUPABASE_URL!;expect(['localhost','127.0.0.1']).toContain(new URL(url).hostname);
 const identity=await createQaIdentity('party-modules');let fixture:LocationSupplierFixture|null=null;
 try{
 fixture=await createLocationSupplierFixture(identity,'eighteenth');
 const auth=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);const session=await auth.auth.signInWithPassword(identity);expect(session.error).toBeNull();const headers={Authorization:'Bearer '+session.data.session!.access_token};
 await login(page,identity);
 const call=async(path:string,method='GET',body?:unknown)=>page.evaluate(async({path,method,body,headers})=>{const r=await fetch(path,{method,headers:{...headers,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,body:await r.json()};},{path,method,body,headers});
 const choose=async(eventId:string)=>expect((await call('/api/my/current-event','POST',{eventId})).status).toBe(200);
 await choose(fixture.eventId);
 expect((await call('/api/my/locations?id='+fixture.savedLocationId,'DELETE')).status).toBe(200);
 expect((await call('/api/my/suppliers?resource_id='+fixture.savedSupplierId,'DELETE')).status).toBe(200);
 await waitForPublicCatalogFixture(page,'location',fixture.locationId,fixture.locationName);
 await page.goto('/it/location/'+fixture.locationId+'?role=party');
 await expect(page.getByRole('heading',{name:fixture.locationName,exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Salva location',exact:true}).click();await expect(page.getByRole('button',{name:'Rimuovi dai salvati',exact:true})).toBeVisible();
 await page.reload();await expect(page.getByRole('button',{name:'Rimuovi dai salvati',exact:true})).toBeVisible();
 await page.goto('/it/fornitori/'+fixture.supplierId);await expect(page.getByRole('heading',{name:fixture.supplierName,exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Salva fornitore',exact:true}).click();await expect(page.getByRole('button',{name:'Rimuovi dai salvati',exact:true})).toBeVisible();
 await page.reload();await expect(page.getByRole('button',{name:'Rimuovi dai salvati',exact:true})).toBeVisible();
 const locations=(await call('/api/my/locations')).body.savedLocations;const suppliers=(await call('/api/my/suppliers')).body.savedSuppliers;
 const savedLocation=locations.find((x:{location_id:string})=>x.location_id===fixture!.locationId);const savedSupplier=suppliers.find((x:{supplier_id:string})=>x.supplier_id===fixture!.supplierId);
 expect(savedLocation.location_role).toBe('party');fixture.savedLocationId=savedLocation.id;fixture.savedSupplierId=savedSupplier.id;
 const wed=await call('/api/event/ensure-default','POST',{eventType:'wedding',country:'it',language:'it',createAdditional:true});expect(wed.status).toBe(200);
 const admin=createClient(url,process.env.PLAYWRIGHT_SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false}});expect((await admin.from('events').update({name:'QA-M8-PARTY-MODULES-WEDDING'}).eq('id',wed.body.eventId).eq('owner_id',identity.id)).error).toBeNull();
 const baptismId=randomUUID();expect((await auth.rpc('save_family_baptism',{p_id:baptismId,p_revision:0,p_plan:{...blankPlan(),name:'QA-M8-PARTY-MODULES-BAPTISM'}})).error).toBeNull();
 for(const eventId of [wed.body.eventId,baptismId]){
 await choose(eventId);
 expect((await call('/api/my/locations')).body.savedLocations.some((x:{id:string})=>x.id===savedLocation.id)).toBe(false);
 expect((await call('/api/my/suppliers')).body.savedSuppliers.some((x:{id:string})=>x.id===savedSupplier.id)).toBe(false);
 expect((await call('/api/my/locations','PATCH',{id:savedLocation.id,selected:true})).status).toBe(404);
 expect((await call('/api/my/suppliers','PATCH',{resource_id:savedSupplier.id,status:'SELECTED'})).status).toBe(404);
 }
 await choose(fixture.eventId);await page.goto('/it/profilo');await page.getByRole('button',{name:/esci/i}).click();await page.waitForURL(/\/it\/?$/);await login(page,identity);
 await choose(fixture.eventId);
 for(const [path,name] of [['location',fixture.locationName],['fornitori',fixture.supplierName]]){await page.goto('/it/'+path+'/'+(path==='location'?fixture.locationId+'?role=party':fixture.supplierId));await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Rimuovi dai salvati',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
 }finally{if(fixture)await deleteLocationSupplierFixture(fixture);await deleteQaIdentity(identity);console.info('[18] supplier/location cleanup PASS; residue=0');}
});

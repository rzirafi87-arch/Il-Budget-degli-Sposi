"use client";
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useLocale} from 'next-intl';
import {getBrowserClient} from '@/lib/supabaseBrowser';
import PartyDetails from './PartyDetails';
import {partyText} from './copy';
export default function PartyTimeline({children}:{children:React.ReactNode}){
 const locale=useLocale(),tx=(text:string)=>partyText(locale,text);
 const [state,setState]=useState<'loading'|'shared'|'party'|'error'>('loading'),[attempt,retry]=useState(0),[party,setParty]=useState<{id:string;event_date:string;name:string}|null>(null),[dirty,setDirty]=useState(false);
 useEffect(()=>{let active=true;void(async()=>{
  const {data}=await getBrowserClient().auth.getSession();if(!data.session){if(active)setState('shared');return;}
  const headers={Authorization:'Bearer '+data.session.access_token};
  const r=await fetch('/api/my/current-event',{headers,cache:'no-store'});if(!r.ok)throw new Error();const current=await r.json();if(!current.currentEvent)throw new Error();
  if(current.currentEvent?.eventType!=='eighteenth'){if(active)setState('shared');return;}
  const summary=await fetch('/api/my/eighteenth-dashboard',{headers,cache:'no-store'});if(!summary.ok)throw new Error();const body=await summary.json();
  if(!body.event?.id||body.event.id!==current.currentEvent.eventId)throw new Error();
  if(active){setParty(body.event);setState('party');}
 })().catch(()=>{if(active)setState('error');});return()=>{active=false;};},[attempt]);
 if(state==='shared')return <>{children}</>;
 if(state==='error')return <div role="alert">{tx('Non riusciamo a caricare i dettagli della festa.')}<button onClick={()=>{setState("loading");retry(n=>n+1);}}>{tx('Riprova caricamento dettagli')}</button></div>;
 if(state==='loading'||!party)return <p role="status">{tx('Caricamento dettagli…')}</p>;
 return <main className="mx-auto grid max-w-xl gap-4 p-4"><h1>{tx('Timeline della festa')}</h1><p>{party.name}</p><PartyDetails key={party.id} locale={locale} eventId={party.id} day={party.event_date.slice(0,10)} name={party.name} initialView="checklist" onDirty={setDirty}/><Link href={`/${locale}/dashboard`} onClick={e=>{if(dirty&&!window.confirm(tx('Hai modifiche non salvate. Vuoi lasciarle?')))e.preventDefault();}}>{tx('Torna alla festa')}</Link></main>;
}

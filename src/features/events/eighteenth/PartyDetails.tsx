"use client";
import {useEffect,useRef,useState} from 'react';
import {getBrowserClient} from '@/lib/supabaseBrowser';
import {emptyPartyPlan,partyDue,partyInvitation,partyPlanError,partyTasks,type PartyPlan} from './plan';

type Props={eventId:string;day:string;name:string;onDirty:(value:boolean)=>void};
export default function PartyDetails({eventId,day,name,onDirty}:Props){
 const [plan,setPlan]=useState<PartyPlan>(emptyPartyPlan),[revision,setRevision]=useState(0),[loaded,setLoaded]=useState(false),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[attempt,retry]=useState(0);
 const [view,setView]=useState('setup');const saving=useRef(false),generation=useRef(0);
 useEffect(()=>{let active=true;const ticket=++generation.current;setLoaded(false);setNotice('');setBusy(false);saving.current=false;
  void (async()=>{const {data,error}=await getBrowserClient().from('eighteenth_party_plans').select('revision,plan').eq('event_id',eventId).maybeSingle();if(error)throw error;if(active&&generation.current===ticket){setPlan({...emptyPartyPlan(),...data?.plan});setRevision(data?.revision||0);setDirty(false);setLoaded(true);}})().catch(()=>{if(active)setNotice('Non riusciamo a caricare i dettagli della festa.');});return()=>{active=false;generation.current++;};
 },[eventId,attempt]);
 useEffect(()=>{onDirty(dirty);return()=>onDirty(false);},[dirty,onDirty]);
 const change=(patch:Partial<PartyPlan>)=>{setPlan(p=>({...p,...patch}));setDirty(true);setNotice('');};
 async function save(){if(saving.current||!loaded)return;const error=partyPlanError(plan,day);if(error){setNotice(error);return;}saving.current=true;setBusy(true);const ticket=generation.current;
  try{const {data,error}=await getBrowserClient().rpc('save_eighteenth_party_plan',{p_id:eventId,p_revision:revision,p_plan:plan});if(error)throw error;if(ticket!==generation.current)return;setRevision(data);setDirty(false);setNotice('Dettagli salvati.');}
  catch(error){if(ticket===generation.current)setNotice(error instanceof Object&&'message' in error&&String(error.message).includes('PARTY_PLAN_CONFLICT')?'La festa è stata modificata altrove. I tuoi dati sono ancora qui: confrontali prima di ricaricare.':'Salvataggio non riuscito. Le modifiche sono ancora qui.');}
  finally{if(ticket===generation.current){saving.current=false;setBusy(false);}}}
 const field=(key:'celebrant'|'venue'|'address'|'startTime'|'replyBy'|'replyContact'|'theme'|'notes',label:string,type='text')=><label className="grid min-w-0 gap-1">{label}<input className="app-input min-h-11 min-w-0" type={type} maxLength={key==='notes'?2000:240} value={plan[key]} onChange={e=>change({[key]:e.target.value})}/></label>;
 const invite=partyInvitation(plan,day,name);
 return <section className="grid min-w-0 gap-4 rounded-2xl border p-4" aria-label="Organizzazione del Diciottesimo">
 <h2 className="text-xl font-semibold">La tua festa, passo dopo passo</h2>
 <nav className="flex flex-wrap gap-2">{[['setup','Chi organizza e luogo'],['programme','Programma'],['checklist','Checklist'],['invite','Invito']].map(([key,label])=><button className="app-button app-button--outline" type="button" key={key} onClick={()=>setView(key)} aria-pressed={view===key}>{label}</button>)}</nav>
 {notice&&<p role={notice==='Dettagli salvati.'?'status':'alert'}>{notice}</p>}
 {!loaded?(notice?<button type="button" onClick={()=>retry(n=>n+1)}>Riprova caricamento dettagli</button>:<p role="status">Caricamento dettagli…</p>):<>
 <fieldset disabled={busy} className="grid min-w-0 gap-3">
 {view==='setup'&&<><label className="grid gap-1">Chi organizza?<select className="app-input min-h-11" value={plan.role} onChange={e=>change({role:e.target.value as PartyPlan['role']})}><option value="celebrant">Festeggio i miei 18 anni</option><option value="organizer">Organizzo per un’altra persona</option></select></label>{field('celebrant','Nome di chi festeggia')}{field('venue','Luogo della festa')}{field('address','Indirizzo')}{field('startTime','Ora di inizio','time')}{field('theme','Tema (facoltativo)')}{field('notes','Note private (escluse dall’invito)')}</>}
 {view==='programme'&&<><p>Puoi indicare anche attività dopo mezzanotte usando il giorno successivo.</p>{plan.programme.map(item=><div className="grid min-w-0 gap-2 rounded-xl border p-3" key={item.id}><label className="grid gap-1">Attività<input className="app-input min-w-0" maxLength={120} value={item.title} onChange={e=>change({programme:plan.programme.map(p=>p.id===item.id?{...p,title:e.target.value}:p)})}/></label><label className="grid gap-1">Data e ora<input className="app-input min-w-0" type="datetime-local" value={item.at} onChange={e=>change({programme:plan.programme.map(p=>p.id===item.id?{...p,at:e.target.value}:p)})}/></label><button type="button" onClick={()=>change({programme:plan.programme.filter(p=>p.id!==item.id)})}>Rimuovi attività</button></div>)}<button type="button" className="app-button app-button--outline" disabled={plan.programme.length>=20} onClick={()=>change({programme:[...plan.programme,{id:crypto.randomUUID(),title:'',at:day+'T'+(plan.startTime||'19:00')}]})}>Aggiungi attività</button></>}
 {view==='checklist'&&partyTasks.map(([key,offset,label])=><label className="flex min-h-11 items-center gap-3" key={key}><input type="checkbox" checked={Boolean(plan.completed[key])} onChange={e=>change({completed:{...plan.completed,[key]:e.target.checked}})}/><span>{label} · {partyDue(day,offset)||'Data da definire'}</span></label>)}
 {view==='invite'&&<>{field('replyBy','Risposta entro','date')}{field('replyContact','Contatto per le conferme')}<label className="grid gap-1">Anteprima invito<textarea readOnly className="app-input min-h-48" value={invite.text}/></label>{!invite.ready&&<p>Completa nome, luogo, indirizzo, orario e riferimenti per le conferme prima di copiare.</p>}<button type="button" className="app-button app-button--outline" disabled={!invite.ready} onClick={()=>{void navigator.clipboard.writeText(invite.text).then(()=>setNotice('Invito copiato.')).catch(()=>setNotice('Copia non riuscita. Seleziona il testo dell’invito.'));}}>Copia invito</button></>}
 </fieldset><div className="flex flex-wrap gap-2"><button type="button" className="app-button app-button--primary" disabled={busy||!dirty} onClick={()=>void save()}>{busy?'Salvataggio…':'Salva dettagli festa'}</button><button type="button" className="app-button app-button--outline" disabled={busy} onClick={()=>{if(!dirty||window.confirm('Ricaricare la versione salvata e lasciare le modifiche?'))retry(n=>n+1);}}>Ricarica dettagli salvati</button></div>
 </>}
 </section>;
}

"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { BAPTISM_CHECKLIST } from "@/data/templates/baptism";

const empty = { name:"", ceremony:"", community:"", reception:"Da decidere", place:"", time:"", budget:"", guests:[] as {name:string; ceremony:boolean; lunch:boolean}[], costs:[] as {name:string; amount:number; paid:number}[], done:[] as string[] };
type Plan = typeof empty;
type Row = {event_id:string; revision:number; plan:Plan};
const money = (v:number) => v.toLocaleString("it-IT",{style:"currency",currency:"EUR"});

export default function FamilyBaptism() {
  const [user,setUser]=useState("");
  const [rows,setRows]=useState<Row[]>([]);
  const [id,setId]=useState("");
  const [revision,setRevision]=useState(0);
  const [plan,setPlan]=useState(empty);
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false);
  const [dirty,setDirty]=useState(false);
  const [guest,setGuest]=useState("");
  const [expense,setExpense]=useState("");
  const [amount,setAmount]=useState("");
  const [paid,setPaid]=useState("");
  useEffect(()=>{
    const db=getBrowserClient();
    const {data}=db.auth.onAuthStateChange((_event,session)=>setUser(session?.user.id || ""));
    return ()=>data.subscription.unsubscribe();
  },[]);
  useEffect(()=>{
    let active=true;
    setRows([]);setId("");setPlan(empty);setDirty(false);
    if(user) void getBrowserClient().from("baptism_family_plans").select("event_id,revision,plan").then(({data,error})=>{
      if(active){if(error)setNotice("Impossibile caricare gli eventi. Ricarica la pagina.");else setRows(data || []);}
    });
    return ()=>{active=false};
  },[user]);
  function open(row:Row){
    if(dirty && !window.confirm("Lasciare le modifiche non salvate?"))return;
    setId(row.event_id);setRevision(row.revision);setPlan(row.plan);setDirty(false);setNotice("");setGuest("");setExpense("");setAmount("");setPaid("");
  }
  function change(p:Partial<Plan>){setPlan({...plan,...p});setDirty(true);setNotice("");}
  async function save(){
    if(plan.reception!=="Solo cerimonia" && plan.time && plan.ceremony && plan.time<=plan.ceremony){setNotice("Il ritrovo deve iniziare dopo la cerimonia.");return}
    setBusy(true);
    try {
      const {data,error}=await getBrowserClient().rpc("save_family_baptism",{p_id:id,p_revision:revision,p_plan:plan});
      if(error)throw error;
      setRevision(data);setRows(old=>[...old.filter(r=>r.event_id!==id),{event_id:id,revision:data,plan}]);setDirty(false);setNotice("Battesimo salvato.");
    }catch{setNotice("Salvataggio non riuscito. Se hai modificato l’evento da un altro dispositivo, riaprilo prima di riprovare.");}finally{setBusy(false)}
  }
  const reception= !["Solo cerimonia","Da decidere"].includes(plan.reception);
  const total=plan.costs.reduce((s,c)=>s+c.amount,0), payments=plan.costs.reduce((s,c)=>s+c.paid,0);
  const invite=["Ci farebbe piacere avervi con noi per il battesimo di "+(plan.name || "nostro figlio")+".", [plan.community,plan.ceremony.replace("T"," ")].filter(Boolean).join(" · "),reception?[plan.reception,plan.place,plan.time.replace("T"," ")].filter(Boolean).join(" · "):""].filter(Boolean).join("\n");
  return <main className="mx-auto max-w-xl space-y-5 p-5"><h1 className="text-3xl font-serif">Organizza il battesimo</h1>
    {!user ? <form className="grid gap-3" onSubmit={async e=>{
      e.preventDefault();const form=new FormData(e.currentTarget);const credentials={email:String(form.get("email")),password:String(form.get("password"))};
      const register=(e.nativeEvent as SubmitEvent).submitter?.getAttribute("value")==="register";
      const auth=getBrowserClient().auth;
      const {data,error}=register?await auth.signUp(credentials):await auth.signInWithPassword(credentials);
      setNotice(error?"Accesso non riuscito. Verifica le credenziali dell’ambiente di prova.":data.session?"":"Conferma la registrazione via email e torna qui per accedere.");
    }}><label>Email<input required name="email" type="email" className="app-input"/></label><label>Password<input required name="password" type="password" className="app-input"/></label><button className="app-button app-button--primary">Accedi</button><button value="register">Crea account di prova</button></form> :
    <><h2>I tuoi battesimi</h2><div className="grid gap-2">{rows.map(r=><button disabled={busy} key={r.event_id} onClick={()=>open(r)}>{r.plan.name || "Bozza battesimo"}</button>)}<button disabled={busy} className="app-button app-button--primary" onClick={()=>open({event_id:crypto.randomUUID(),revision:0,plan:empty})}>Nuovo battesimo</button></div>
    {id && <form onSubmit={e=>{e.preventDefault();void save()}}><fieldset disabled={busy} className="grid gap-4">
    <h2 className="text-xl font-serif">Cerimonia e ritrovo</h2>
    {([["name","Nome del bambino","text"],["community","Comunità scelta e indirizzo","text"],["ceremony","Data e ora della cerimonia","datetime-local"],["budget","Budget massimo (€)","number"]] as const).map(([k,label,type])=><label key={k}>{label}<input className="app-input" type={type} maxLength={120} min="0" step="0.01" value={plan[k]} onChange={e=>change({[k]:e.target.value})}/></label>)}
    <label>Ritrovo<select className="app-select" value={plan.reception} onChange={e=>change({reception:e.target.value})}>{["Da decidere","Solo cerimonia","Rinfresco in casa","Pranzo in famiglia","Ricevimento in sala"].map(x=><option key={x}>{x}</option>)}</select></label>
    {reception && <><label>Luogo e indirizzo<input className="app-input" value={plan.place} onChange={e=>change({place:e.target.value})}/></label><label>Data e ora del ritrovo<input type="datetime-local" className="app-input" value={plan.time} onChange={e=>change({time:e.target.value})}/></label></>}
    <details><summary>Invitati e conferme ({plan.guests.filter(g=>g.ceremony).length} alla cerimonia)</summary>
    {plan.guests.map((g,i)=><div key={i} className="grid gap-1 border-b py-2"><strong>{g.name}</strong>{(["ceremony",...(reception?["lunch"]:[])] as ("ceremony"|"lunch")[]).map(k=><label key={k}><input type="checkbox" checked={g[k]} onChange={e=>change({guests:plan.guests.map((x,j)=>i===j?{...x,[k]:e.target.checked}:x)})}/> {k==="ceremony"?"Confermato alla cerimonia":"Confermato al ritrovo"}</label>)}<button type="button" onClick={()=>change({guests:plan.guests.filter((_,j)=>j!==i)})}>Rimuovi invitato</button></div>)}
    <label>Nome invitato<input className="app-input" value={guest} onChange={e=>setGuest(e.target.value)}/></label><button type="button" disabled={!guest.trim()} onClick={()=>{change({guests:[...plan.guests,{name:guest.trim(),ceremony:false,lunch:false}]});setGuest("")}}>Aggiungi invitato</button></details>
    <details><summary>Budget e pagamenti · {money(total)}</summary><p>Pagato {money(payments)} · Da pagare {money(plan.costs.reduce((s,c)=>s+Math.max(0,c.amount-c.paid),0))}</p>{plan.budget && <p>Margine {money(Number(plan.budget)-total)}</p>}
    {plan.costs.map((c,i)=><label key={i} className="block">{c.name} · {money(c.amount)} · Importo pagato<input type="number" min="0" step=".01" className="app-input" value={c.paid} onChange={e=>change({costs:plan.costs.map((x,j)=>j===i?{...x,paid:Number(e.target.value)}:x)})}/></label>)}
    <label>Voce di spesa<input className="app-input" value={expense} onChange={e=>setExpense(e.target.value)}/></label><label>Previsto (€)<input className="app-input" type="number" min="0" step=".01" value={amount} onChange={e=>setAmount(e.target.value)}/></label><label>Acconto (€)<input className="app-input" type="number" min="0" step=".01" value={paid} onChange={e=>setPaid(e.target.value)}/></label>
    <button type="button" disabled={!expense.trim()||!amount||Number(amount)<0||Number(paid)<0} onClick={()=>{change({costs:[...plan.costs,{name:expense,amount:Number(amount),paid:Number(paid)}]});setExpense("");setPaid("");setAmount("")}}>Aggiungi spesa</button></details>
    <details><summary>Checklist</summary>{BAPTISM_CHECKLIST.map(t=>{const due=plan.ceremony?new Date(plan.ceremony):null;if(due)due.setDate(due.getDate()-7*t.weeksBefore);return <label key={t.title} className="block py-2"><input type="checkbox" checked={plan.done.includes(t.title)} onChange={e=>change({done:e.target.checked?[...plan.done,t.title]:plan.done.filter(v=>v!==t.title)})}/> {t.title} {due?.toLocaleDateString("it-IT")}</label>})}</details>
    <details><summary>Invito e promemoria</summary><textarea readOnly className="app-input" value={invite}/>{[["Copia invito",invite],["Copia promemoria","Ci fate sapere chi sarà presente?\n"+invite]].map(([label,txt])=><button key={label} type="button" className="app-button" onClick={async()=>{try{await navigator.clipboard.writeText(txt);setNotice("Testo copiato.")}catch{setNotice("Seleziona il testo dell’invito per copiarlo.")}}}>{label}</button>)}</details>
    <button className="app-button app-button--primary">{busy?"Salvataggio…":revision?"Salva modifiche":"Salva battesimo"}</button></fieldset></form>}</>}
    <p role="status">{notice}</p></main>;
}

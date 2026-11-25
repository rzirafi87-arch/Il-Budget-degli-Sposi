"use client";
import {partyText} from "./copy";
import {useEffect,useRef,useState} from 'react';
import {getBrowserClient} from '@/lib/supabaseBrowser';
type Props={locale?:string;eventId:string;expenseId:string;remaining:number;blocked:boolean;onSaved:()=>void;onDirty:(expenseId:string,dirty:boolean)=>void};
export default function PartyPayment({locale="it",eventId,expenseId,remaining,blocked,onSaved,onDirty}:Props){
 const tx=(text:string)=>partyText(locale,text);
 const [open,setOpen]=useState(false),[amount,setAmount]=useState(''),[date,setDate]=useState(''),[note,setNote]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const saving=useRef(false),request=useRef<{id:string;signature:string}|null>(null);
 useEffect(()=>{onDirty(expenseId,Boolean(amount||date||note));return()=>onDirty(expenseId,false);},[amount,date,note,onDirty,expenseId]);
 async function save(){
  if(saving.current||blocked)return;
  if(!/^\d+(\.\d{1,2})?$/.test(amount)||Number(amount)<=0||Number(amount)>remaining||!/^\d{4}-\d{2}-\d{2}$/.test(date)){setNotice(tx("Indica un importo entro il saldo e la data del pagamento."));return;}
  const signature=JSON.stringify([amount,date,note]);
  if(request.current&&request.current.signature!==signature){setNotice(tx("Il pagamento precedente ha esito incerto. Riprova con gli stessi dati oppure ricarica per verificare il pagato prima di cambiarli."));return;}
  request.current??={id:crypto.randomUUID(),signature};saving.current=true;setBusy(true);setNotice('');
  try{const {error}=await getBrowserClient().rpc('record_eighteenth_payment',{p_event:eventId,p_expense:expenseId,p_payment:request.current.id,p_amount:Number(amount),p_date:date,p_note:note});if(error)throw error;setAmount('');setOpen(false);request.current=null;onSaved();}
  catch{setNotice(tx("Pagamento non confermato. Riprova con gli stessi dati: il pagamento non verrà duplicato."));}
  finally{saving.current=false;setBusy(false);}
 }
 return <div className="grid min-w-0 gap-2 rounded-xl border p-3">
 <button type="button" className="app-button app-button--outline" disabled={blocked||busy} onClick={()=>setOpen(v=>!v)}>{open?tx("Chiudi pagamento"):tx("Registra acconto o saldo")}</button>
 {open&&<fieldset disabled={busy||blocked} className="grid min-w-0 gap-2"><legend>{tx("Pagamento della spesa")}</legend><label className="grid">{tx("Importo pagamento (€)")}<input className="app-input min-w-0" type="number" min="0.01" step="0.01" max={remaining} value={amount} onChange={e=>setAmount(e.target.value)}/></label><label className="grid">{tx("Data pagamento")}<input className="app-input min-w-0" type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label className="grid">{tx("Nota pagamento (privata)")}<input className="app-input min-w-0" maxLength={500} value={note} onChange={e=>setNote(e.target.value)}/></label><button type="button" className="app-button app-button--primary" onClick={()=>void save()}>{tx("Conferma pagamento")}</button></fieldset>}
 {notice&&<p role="alert">{notice}</p>}
 </div>;
}

export type PartyPlan = {
  version: 1; role: 'celebrant' | 'organizer'; celebrant: string; venue: string; address: string;
  startTime: string; replyBy: string; replyContact: string; theme: string; notes: string;
  programme: { id: string; title: string; at: string }[]; completed: Record<string, boolean>;
};
export const emptyPartyPlan = (): PartyPlan => ({version:1,role:'celebrant',celebrant:'',venue:'',address:'',startTime:'',replyBy:'',replyContact:'',theme:'',notes:'',programme:[],completed:{}});
export const partyTasks = [
 ['budget',-60,'Definisci il budget'],['venue',-45,'Conferma il luogo della festa'],['suppliers',-30,'Conferma catering, torta e musica'],
 ['invites',-28,'Invia gli inviti'],['replies',-10,'Raccogli le conferme'],['counts',-7,'Comunica presenze e menù'],['payments',-3,'Controlla acconti e saldi'],['programme',-1,'Condividi il programma'],['thanks',3,'Invia i ringraziamenti'],
] as const;
const validDate = (value:string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value+'T12:00:00Z')) && new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
export function partyPlanError(plan:PartyPlan, day:string) {
 if(!['celebrant','organizer'].includes(plan.role))return 'Scegli chi organizza la festa.';
 if(plan.replyBy && (!validDate(plan.replyBy)||plan.replyBy>day))return 'La scadenza delle risposte deve precedere la festa.';
 if(plan.startTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(plan.startTime))return 'Controlla l’orario della festa.';
 if(plan.programme.some(p=>!p.title.trim()||!/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(p.at)||!validDate(p.at.slice(0,10))||p.at<day+'T'+(plan.startTime||'00:00')))return 'Ogni attività deve avere nome e data/orario validi, a partire dalla festa.';
 return '';
}
export function partyDue(day:string,offset:number){if(!validDate(day))return '';const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10);}
export function partyInvitation(plan:PartyPlan, day:string, fallbackName:string){
 const name=plan.celebrant.trim()||fallbackName;
 const ready=Boolean(name&&validDate(day)&&plan.startTime&&plan.venue.trim()&&plan.address.trim()&&plan.replyBy&&plan.replyContact.trim()&&!partyPlanError(plan,day));
 const date=validDate(day)?new Intl.DateTimeFormat('it',{dateStyle:'long',timeZone:'UTC'}).format(new Date(day+'T12:00:00Z')):'';
 const intro=plan.role==='celebrant'?`Ti invito a festeggiare i miei 18 anni! Sono ${name}.`:`Festeggiamo insieme i 18 anni di ${name}!`;
 return {ready,text:[intro,`${date} alle ${plan.startTime}`,`${plan.venue} · ${plan.address}`,plan.theme?`Tema: ${plan.theme}`:'',`Conferma entro il ${plan.replyBy} a ${plan.replyContact}.`].filter(Boolean).join('\n')};
}

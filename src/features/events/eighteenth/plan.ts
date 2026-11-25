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
export function partyInvitation(plan:PartyPlan, day:string, fallbackName:string,locale="it"){
 const name=plan.celebrant.trim()||fallbackName;
 const ready=Boolean(name&&validDate(day)&&plan.startTime&&plan.venue.trim()&&plan.address.trim()&&plan.replyBy&&plan.replyContact.trim()&&!partyPlanError(plan,day));
 const date=validDate(day)?new Intl.DateTimeFormat(locale,{dateStyle:'long',timeZone:'UTC'}).format(new Date(day+'T12:00:00Z')):'';
 const wording:Record<string,[string,string,string,string,string]>={
 it:[`Ti invito a festeggiare i miei 18 anni! Sono ${name}.`,`Festeggiamo insieme i 18 anni di ${name}!`,'alle','Tema','Conferma entro il'],
 en:[`Join me for my 18th birthday! I'm ${name}.`,`Let's celebrate ${name}'s 18th birthday!`,'at','Theme','Please reply by'],
 fr:[`Je vous invite à fêter mes 18 ans ! Je suis ${name}.`,`Fêtons ensemble les 18 ans de ${name} !`,'à','Thème','Merci de répondre avant le'],
 es:[`¡Te invito a celebrar mis 18 años! Soy ${name}.`,`¡Celebremos los 18 años de ${name}!`,'a las','Tema','Confirma antes del'],
 de:[`Feiere meinen 18. Geburtstag mit mir! Ich bin ${name}.`,`Feiern wir zusammen den 18. Geburtstag von ${name}!`,'um','Motto','Bitte antworte bis'],
 };
 const w=wording[locale]||wording.it;
 return {ready,text:[w[plan.role==='celebrant'?0:1],`${date} ${w[2]} ${plan.startTime}`,`${plan.venue} · ${plan.address}`,plan.theme?`${w[3]}: ${plan.theme}`:'',`${w[4]} ${plan.replyBy} · ${plan.replyContact}.`].filter(Boolean).join('\n')};
}

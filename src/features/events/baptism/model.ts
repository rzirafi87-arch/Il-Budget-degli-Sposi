import it from './it.json';
import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import de from './de.json';

export type Attendance = 'pending' | 'yes' | 'no';
export type Scenario = 'later' | 'solo' | 'home' | 'lunch' | 'hall';
export type Guest = { id: string; name: string; group: string; contact: string; kind: 'adult' | 'child'; companionOf: string; ceremony: Attendance; reception: Attendance; menu: 'adult' | 'child' | 'none' | 'pending'; food: string; access: string };
export type Cost = { id: string; name: string; scope: 'ceremony' | 'reception'; enabled: boolean; quantity: number; unitCost: number; quote: string; payments: { id: string; amount: number; date: string; note: string }[] };
export type TaskState = { completed: boolean; due: string; completedAt: string; customDue: string; skipped: boolean };
export type Plan = {
  version: 2; name: string; community: string; contact: string; venue: string; address: string; ceremony: string; ceremonyConfirmed: boolean;
  scenario: Scenario; place: string; receptionAddress: string; time: string; receptionConfirmed: boolean; budget: string;
  adults: number; companions: number; children: number; noMeal: number; godparents: string; theme: string; photographer: boolean; photoScope: string; favours: boolean;
  communityNote: string; replyBy: string; replyContact: string; arrivalNote: string; guests: Guest[]; costs: Cost[]; tasks: Record<string, TaskState>; draft: boolean;
};
export const blankPlan = (): Plan => ({ version: 2, name: '', community: '', contact: '', venue: '', address: '', ceremony: '', ceremonyConfirmed: false, scenario: 'later', place: '', receptionAddress: '', time: '', receptionConfirmed: false, budget: '', adults: 0, companions: 0, children: 0, noMeal: 0, godparents: '', theme: '', photographer: false, photoScope: 'ceremony', favours: false, communityNote: '', replyBy: '', replyContact: '', arrivalNote: '', guests: [], costs: [], tasks: {}, draft: true });
export const hasReception = (p: Plan) => ['home','lunch','hall'].includes(p.scenario);
export const scenarioKey: Record<Scenario, string> = { later:'receptionLater', solo:'soloCeremony', home:'scenarioHome', lunch:'scenarioLunch', hall:'scenarioHall' };
export function translator(locale: string) {
  const catalog: Record<string,string> = ({it,en,es,fr,de} as Record<string, Record<string,string>>)[locale] || it;
  return (key: string, args: Record<string,string|number> = {}) => (catalog[key] || key).replace(/\{(\w+)\}/g, (_, name) => String(args[name] ?? ''));
}
export const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
export function totals(p: Plan) {
  return p.costs.reduce((s,c) => {
    const forecast = c.enabled && (c.scope !== 'reception' || hasReception(p)) ? round(c.quantity * c.unitCost) : 0;
    const paid = round(c.payments.reduce((sum, payment) => sum + payment.amount,0));
    return { forecast: round(s.forecast+forecast), paid: round(s.paid+paid), unpaid: round(s.unpaid+Math.max(0,forecast-paid)), excess: round(s.excess+Math.max(0,paid-forecast)) };
  }, {forecast:0,paid:0,unpaid:0,excess:0});
}
export const tasks = [
  ['community',-56],['estimate',-56],['venues',-42],['menu',-35],['invite',-28],['photographer',-21],['favours',-21],['replies',-10],['finalCounts',-7],['practical',-1],['day',0],['close',7],
] as const;
export function dueDate(p: Plan, key: string, offset: number) {
  const state=p.tasks[key];
  if(state?.completed) return state.due;
  if(state?.customDue) return state.customDue;
  if(!p.ceremonyConfirmed || !p.ceremony) return '';
  const date=new Date(p.ceremony.slice(0,10)+'T12:00:00Z');
  date.setUTCDate(date.getUTCDate()+offset);
  return date.toISOString().slice(0,10);
}
export function visibleTasks(p: Plan) {
  return tasks.filter(([key]) => !(['menu','finalCounts'].includes(key) && !hasReception(p)) && !(key==='photographer'&&!p.photographer) && !(key==='favours'&&!p.favours));
}
export function validate(p: Plan): Record<string,string> {
  const errors: Record<string,string> = {};
  for(const key of ['ceremony','time'] as const) if(p[key] && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(p[key]) || !Number.isFinite(Date.parse(p[key])))) errors[key]='setup.dateTimeError';
  if (p.ceremonyConfirmed && !p.ceremony.slice(0,10)) errors.ceremony='setup.confirmDateError';
  if (hasReception(p) && p.ceremony && p.time && p.time<=p.ceremony) errors.time='setup.receptionOrderError';
  if (hasReception(p) && p.receptionConfirmed && (!p.time || !p.place.trim() || !p.receptionAddress.trim())) errors.time='setup.confirmReceptionError';
  if (p.companions>p.adults) errors.companions='setup.companionCountError';
  for (const key of ['adults','companions','children','noMeal'] as const) if (!Number.isSafeInteger(p[key]) || p[key]<0) errors[key]='setup.countError';
  if (p.budget!=='' && (!Number.isFinite(Number(p.budget)) || Number(p.budget)<0)) errors.budget='setup.moneyError';
  if (p.replyBy && p.ceremony && p.replyBy>=p.ceremony.slice(0,10)) errors.replyBy='invite.replyByError';
  if(p.guests.some(g=>!g.name.trim())) errors.guests='guests.nameError';
  if(p.costs.some(c=>!c.name.trim()||!Number.isFinite(c.unitCost)||c.unitCost<0||!Number.isSafeInteger(c.quantity)||c.quantity<0||c.payments.some(a=>!Number.isFinite(a.amount)||a.amount<0))) errors.costs='setup.moneyError';
  return errors;
}
export function invitation(p: Plan, locale: string) {
  const t=translator(locale), date=(value:string)=> value ? new Date(value.slice(0,10)+'T12:00:00Z').toLocaleDateString(locale,{day:'numeric',month:'long',year:'numeric'}) : '';
  const args={childName:p.name,ceremonyDate:date(p.ceremony),ceremonyTime:p.ceremony.slice(11,16),ceremonyVenue:p.venue||p.community,ceremonyAddress:p.address,receptionDate:date(p.time),receptionTime:p.time.slice(11,16),receptionVenue:p.place,receptionAddress:p.receptionAddress,replyBy:date(p.replyBy),replyContact:p.replyContact,arrivalNote:p.arrivalNote};
  const ready=p.name && p.ceremony && p.ceremony.slice(11,16) && (p.venue||p.community) && p.address && p.replyBy && p.replyContact && p.ceremonyConfirmed && (p.scenario==='solo'||hasReception(p)&&p.receptionConfirmed) && !Object.keys(validate(p)).length;
  const lines=[t('invite.intro',args),t('invite.ceremonyLine',args),...(hasReception(p)?[t('invite.'+p.scenario+'Line',args)]:[]),t(hasReception(p)?'invite.replyBoth':'invite.replyOnly',args),t(hasReception(p)?'invite.replyPartyDetails':'invite.replyCeremonyDetails',args),...(p.arrivalNote?[t('invite.practicalLine',args)]:[])];
  return {ready:Boolean(ready),text:lines.join('\n'),args};
}

// Import the existing QA prototype without losing its payments or RSVP state.
export function upgradePlan(raw: Record<string,unknown>): Plan {
  if(raw.version===2) return {...blankPlan(),...raw} as Plan;
  const reception=String(raw.reception||'');
  const p={...blankPlan(),...raw,scenario:({'Solo cerimonia':'solo','Rinfresco in casa':'home','Pranzo in famiglia':'lunch','Ricevimento in sala':'hall'} as Record<string,Scenario>)[reception]||'later'} as Plan;
  p.guests=((raw.guests||[]) as {name:string;ceremony:boolean;lunch:boolean}[]).map(g=>({id:crypto.randomUUID(),name:g.name,group:'',contact:'',kind:'adult',companionOf:'',ceremony:g.ceremony?'yes':'pending',reception:g.lunch?'yes':'pending',menu:'pending',food:'',access:''}));
  p.costs=((raw.costs||[]) as {name:string;amount:number;paid:number}[]).map((c,i)=>({id:crypto.randomUUID(),name:c.name,scope:'ceremony',enabled:true,quantity:1,unitCost:c.amount,quote:'',payments:c.paid?[{id:`legacy-payment-${i}`,amount:c.paid,date:'',note:''}]:[]}));
  return p;
}

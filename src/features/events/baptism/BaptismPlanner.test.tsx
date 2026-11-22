import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {blankPlan} from './model';

const mockRpc=jest.fn(), mockList=jest.fn(), mockLogout=jest.fn();
let mockAuthChange: (event:string,session:{user:{id:string}}|null)=>void;
jest.mock('next-intl',()=>({useLocale:()=> 'it'}));
jest.mock('next/link',()=>({__esModule:true,default:(props:React.AnchorHTMLAttributes<HTMLAnchorElement>)=><a {...props}/>}));
jest.mock('@/lib/logout',()=>({logoutCurrentSession:(...args:unknown[])=>mockLogout(...args)}));
jest.mock('@/lib/supabaseBrowser',()=>({getBrowserClient:()=>({
 auth:{getSession:async()=>({data:{session:{user:{id:'owner-a'}}}}),onAuthStateChange:(callback:typeof mockAuthChange)=>{mockAuthChange=callback;return {data:{subscription:{unsubscribe:jest.fn()}}};}},
 from:()=>({select:()=>mockList()}),rpc:(...args:unknown[])=>mockRpc(...args)
})}));
import BaptismPlanner from './BaptismPlanner';

it('preserves local edits on a revision conflict and allows cancelling reload',async()=>{
 localStorage.setItem('baptism:last-event:owner-a','event-a');render(<BaptismPlanner/>);
 await screen.findByRole('heading',{name:'Il battesimo di Vittoria'});
 fireEvent.click(screen.getAllByRole('button',{name:'Modifica'})[0]);
 const name=screen.getByLabelText('Nome da mostrare nell’evento');fireEvent.change(name,{target:{value:'Vittoria locale'}});
 mockRpc.mockResolvedValueOnce({error:{message:'BAPTISM_CONFLICT'}});
 fireEvent.click(screen.getByRole('button',{name:'Salva'}));
 expect(await screen.findByText(/Evento modificato altrove/)).toBeInTheDocument();expect(name).toHaveValue('Vittoria locale');
 const confirm=jest.spyOn(window,'confirm').mockReturnValue(false);
 fireEvent.click(screen.getByRole('button',{name:'Ricarica la versione salvata'}));
 expect(name).toHaveValue('Vittoria locale');expect(mockRpc).toHaveBeenCalledTimes(2);confirm.mockRestore();
});

const stored={event_id:'event-a',revision:2,plan:{...blankPlan(),name:'Vittoria',draft:false}};
beforeEach(()=>{
 window.history.replaceState({},'', '/it/battesimo');
 localStorage.clear();mockRpc.mockReset();mockList.mockReset();mockLogout.mockReset();
 mockList.mockResolvedValue({data:[stored],error:null});mockRpc.mockResolvedValue({data:stored,error:null});
 Object.defineProperty(globalThis.crypto,'randomUUID',{configurable:true,value:()=> 'new-id'});
 window.requestAnimationFrame=callback=>{callback(0);return 0;};
});

it('opens the explicitly selected baptism instead of the remembered one',async()=>{
 window.history.replaceState({},'', '/it/battesimo?eventId=event-b');
 localStorage.setItem('baptism:last-event:owner-a','event-a');
 const selected={...stored,event_id:'event-b',plan:{...stored.plan,name:'Secondo'}};
 mockList.mockResolvedValue({data:[stored,selected],error:null});mockRpc.mockResolvedValue({data:selected,error:null});
 render(<BaptismPlanner/>);
 expect(await screen.findByRole('heading',{name:'Il battesimo di Secondo'})).toBeInTheDocument();
 expect(mockRpc).toHaveBeenCalledWith('read_family_baptism',{p_id:'event-b'});
 expect(localStorage.getItem('baptism:last-event:owner-a')).toBe('event-b');
});
it('does not fall back to remembered data when an explicit event is unauthorized',async()=>{
 window.history.replaceState({},'', '/it/battesimo?eventId=foreign-event');
 localStorage.setItem('baptism:last-event:owner-a','event-a');render(<BaptismPlanner/>);
 expect(await screen.findByText('Non siamo riusciti a caricare il battesimo. Riprova.')).toBeInTheDocument();
 expect(mockRpc).not.toHaveBeenCalled();
});
it('lets the user cancel event switching without losing local edits',async()=>{
 localStorage.setItem('baptism:last-event:owner-a','event-a');render(<BaptismPlanner/>);
 await screen.findByRole('heading',{name:'Il battesimo di Vittoria'});
 fireEvent.click(screen.getAllByRole('button',{name:'Modifica'})[0]);
 fireEvent.change(screen.getByLabelText('Nome da mostrare nell’evento'),{target:{value:'Modifica locale'}});
 const confirm=jest.spyOn(window,'confirm').mockReturnValue(false);
 expect(fireEvent.click(screen.getByRole('link',{name:'Cambia evento'}))).toBe(false);
 expect(screen.getByLabelText('Nome da mostrare nell’evento')).toHaveValue('Modifica locale');
 expect(confirm).toHaveBeenCalled();confirm.mockRestore();
});

it('reopens the remembered authorized event from its canonical data',async()=>{
 localStorage.setItem('baptism:last-event:owner-a','event-a');render(<BaptismPlanner/>);
 expect(await screen.findByRole('heading',{name:'Il battesimo di Vittoria'})).toBeInTheDocument();
 expect(mockRpc).toHaveBeenCalledWith('read_family_baptism',{p_id:'event-a'});
});
it('does not assign another event when the remembered identifier is unavailable',async()=>{
 localStorage.setItem('baptism:last-event:owner-a','foreign-event');render(<BaptismPlanner/>);
 expect(await screen.findByRole('button',{name:'Vittoria'})).toBeInTheDocument();
 expect(mockRpc).not.toHaveBeenCalled();
 expect(screen.queryByRole('heading',{name:'Il battesimo di Vittoria'})).not.toBeInTheDocument();
});
it('opens a saved draft in setup and keeps the entered name after a failed save',async()=>{
 mockRpc.mockResolvedValueOnce({data:{...stored,plan:{...stored.plan,draft:true}},error:null});
 render(<BaptismPlanner/>);fireEvent.click(await screen.findByRole('button',{name:'Vittoria'}));
 const name=await screen.findByLabelText('Nome da mostrare nell’evento');
 fireEvent.change(name,{target:{value:'Vittoria aggiornata'}});
 mockRpc.mockResolvedValueOnce({error:{message:'Network unavailable'}});
 fireEvent.click(screen.getByRole('button',{name:'Salva bozza'}));
 expect(await screen.findByText('Non siamo riusciti a salvare. Riprova.')).toBeInTheDocument();
 expect(name).toHaveValue('Vittoria aggiornata');expect(screen.getByRole('button',{name:'Salva bozza'})).toBeEnabled();
});
it('keeps an invalid guest in the guests module and never sends the invalid draft',async()=>{
 render(<BaptismPlanner/>);fireEvent.click(await screen.findByRole('button',{name:'Nuovo battesimo'}));
 fireEvent.click(screen.getByRole('button',{name:'Invitati'}));
 fireEvent.click(screen.getByRole('button',{name:'Aggiungi invitato'}));
 fireEvent.click(screen.getByRole('button',{name:'Salva bozza'}));
 expect(screen.getByRole('alert')).toHaveTextContent('Inserisci un nome per salvare l’invitato.');
 expect(screen.getByLabelText('Nome o nome del gruppo')).toBeInTheDocument();expect(mockRpc).not.toHaveBeenCalled();
});
it('does not reveal a delayed event response after signing out',async()=>{
 let resolveRead!:(value:unknown)=>void;
 mockRpc.mockReturnValueOnce(new Promise(resolve=>{resolveRead=resolve;}));
 localStorage.setItem('baptism:last-event:owner-a','event-a');render(<BaptismPlanner/>);
 await waitFor(()=>expect(mockRpc).toHaveBeenCalled());
 act(()=>mockAuthChange('SIGNED_OUT',null));
 await act(async()=>resolveRead({data:stored,error:null}));
 expect(screen.getByText('Accedi per ritrovare il tuo battesimo.')).toBeInTheDocument();
 expect(screen.queryByText('Vittoria')).not.toBeInTheDocument();
});
it('reports logout failure without discarding the event',async()=>{
 mockLogout.mockRejectedValue(new Error('offline'));localStorage.setItem('baptism:last-event:owner-a','event-a');render(<BaptismPlanner/>);
 await screen.findByRole('heading',{name:'Il battesimo di Vittoria'});fireEvent.click(screen.getByRole('button',{name:'Esci'}));
 expect(await screen.findByText('Non siamo riusciti a uscire. I dati sono ancora qui: riprova.')).toBeInTheDocument();
 expect(screen.getByRole('heading',{name:'Il battesimo di Vittoria'})).toBeInTheDocument();
});

it('applies confirmed menus only after confirmation, preserving price and deposits',async()=>{
 const guest={id:'g',name:'Persona QA',group:'',contact:'',kind:'adult',companionOf:'',ceremony:'yes',reception:'yes',menu:'adult',food:'',access:''};
 const cost={id:'c',name:'Pranzo',scope:'reception',enabled:true,quantity:22,unitCost:38,quote:'',payments:[{id:'p',amount:150,date:'2027-01-01',note:''}]};
 mockRpc.mockResolvedValueOnce({data:{...stored,plan:{...stored.plan,scenario:'lunch',guests:[guest],costs:[cost]}},error:null});
 localStorage.setItem('baptism:last-event:owner-a','event-a');render(<BaptismPlanner/>);await screen.findByRole('heading',{name:'Il battesimo di Vittoria'});
 fireEvent.click(screen.getByRole('button',{name:'Budget del battesimo'}));
 const confirm=jest.spyOn(window,'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
 fireEvent.click(screen.getByRole('button',{name:'Usa 1 · Menù adulto'}));expect(screen.getByLabelText('Quantità')).toHaveValue(22);
 fireEvent.click(screen.getByRole('button',{name:'Usa 1 · Menù adulto'}));expect(screen.getByLabelText('Quantità')).toHaveValue(1);expect(screen.getByLabelText('Costo unitario')).toHaveValue(38);
 mockRpc.mockResolvedValueOnce({data:3,error:null});fireEvent.click(screen.getByRole('button',{name:'Salva'}));
 await waitFor(()=>expect(mockRpc).toHaveBeenCalledWith('save_family_baptism',expect.objectContaining({p_plan:expect.objectContaining({costs:[{...cost,quantity:1}]})})));confirm.mockRestore();
});

async function openPayment() {
 const cost={id:'c',name:'Fotografo',scope:'ceremony',enabled:true,quantity:1,unitCost:300,quote:'',payments:[]};
 mockRpc.mockResolvedValueOnce({data:{...stored,plan:{...stored.plan,costs:[cost]}},error:null});
 localStorage.setItem('baptism:last-event:owner-a','event-a');render(<BaptismPlanner/>);
 await screen.findByRole('heading',{name:'Il battesimo di Vittoria'});
 fireEvent.click(screen.getByRole('button',{name:'Budget del battesimo'}));
 fireEvent.click(screen.getByRole('button',{name:'Registra pagamento'}));
 fireEvent.change(screen.getByLabelText('Importo (€)'),{target:{value:'75'}});
 return cost;
}

it('requires adding the pending payment before saving, then persists it exactly once',async()=>{
 const cost=await openPayment();
 fireEvent.click(screen.getByRole('button',{name:'Salva'}));
 expect(screen.getByRole('status')).toHaveTextContent('Aggiungi o annulla il pagamento aperto');
 expect(mockRpc).toHaveBeenCalledTimes(1);
 expect(screen.getByLabelText('Importo (€)')).toHaveValue(75);
 fireEvent.click(screen.getByRole('button',{name:'Aggiungi pagamento'}));
 mockRpc.mockResolvedValueOnce({data:3,error:null});
 fireEvent.click(screen.getByRole('button',{name:'Salva'}));
 await waitFor(()=>expect(mockRpc).toHaveBeenCalledWith('save_family_baptism',expect.objectContaining({p_plan:expect.objectContaining({costs:[expect.objectContaining({...cost,payments:[expect.objectContaining({amount:75})]})]})})));
});

it('protects a pending payment from replacement, removal, reload, logout and page exit',async()=>{
 await openPayment();
 fireEvent.click(screen.getByRole('button',{name:'Registra pagamento'}));
 expect(screen.getByLabelText('Importo (€)')).toHaveValue(75);
 fireEvent.click(screen.getByRole('button',{name:'Rimuovi'}));
 expect(screen.getByLabelText('Importo (€)')).toHaveValue(75);
 const confirm=jest.spyOn(window,'confirm').mockReturnValue(false);
 fireEvent.click(screen.getByRole('button',{name:'Ricarica la versione salvata'}));
 fireEvent.click(screen.getByRole('button',{name:'Nuovo battesimo'}));
 fireEvent.click(screen.getByRole('button',{name:'Esci'}));
 expect(mockRpc).toHaveBeenCalledTimes(1);expect(mockLogout).not.toHaveBeenCalled();
 const exit=new Event('beforeunload',{cancelable:true});window.dispatchEvent(exit);expect(exit.defaultPrevented).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'Annulla'}));expect(screen.getByLabelText('Importo (€)')).toHaveValue(75);
 confirm.mockReturnValue(true);fireEvent.click(screen.getByRole('button',{name:'Annulla'}));
 expect(screen.queryByLabelText('Importo (€)')).not.toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Salva'})).toBeDisabled();
 confirm.mockRestore();
});

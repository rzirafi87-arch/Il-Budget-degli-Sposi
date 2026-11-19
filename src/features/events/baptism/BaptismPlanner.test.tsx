import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {blankPlan} from './model';

const mockRpc=jest.fn(), mockList=jest.fn(), mockLogout=jest.fn();
let mockAuthChange: (event:string,session:{user:{id:string}}|null)=>void;
jest.mock('next-intl',()=>({useLocale:()=> 'it'}));
jest.mock('next/link',()=>({__esModule:true,default:({children,href}:{children:React.ReactNode;href:string})=><a href={href}>{children}</a>}));
jest.mock('@/lib/logout',()=>({logoutCurrentSession:(...args:unknown[])=>mockLogout(...args)}));
jest.mock('@/lib/supabaseBrowser',()=>({getBrowserClient:()=>({
 auth:{getSession:async()=>({data:{session:{user:{id:'owner-a'}}}}),onAuthStateChange:(callback:typeof mockAuthChange)=>{mockAuthChange=callback;return {data:{subscription:{unsubscribe:jest.fn()}}};}},
 from:()=>({select:()=>mockList()}),rpc:(...args:unknown[])=>mockRpc(...args)
})}));
import BaptismPlanner from './BaptismPlanner';

const stored={event_id:'event-a',revision:2,plan:{...blankPlan(),name:'Vittoria',draft:false}};
beforeEach(()=>{
 localStorage.clear();mockRpc.mockReset();mockList.mockReset();mockLogout.mockReset();
 mockList.mockResolvedValue({data:[stored],error:null});mockRpc.mockResolvedValue({data:stored,error:null});
 Object.defineProperty(globalThis.crypto,'randomUUID',{configurable:true,value:()=> 'new-id'});
 window.requestAnimationFrame=callback=>{callback(0);return 0;};
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
